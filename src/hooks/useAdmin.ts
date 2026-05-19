import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type OficinaAdmin = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string;
  trial_ate: string | null;
  plano_nome: string | null;
  plano_preco: number | null;
  total_usuarios: number;
  total_ordens: number;
  ultima_atividade: string | null;
  created_at: string;
};

export type Plano = {
  id: string;
  nome: string;
  preco: number;
  limite_usuarios: number | null;
  limite_ordens_mes: number | null;
  funcionalidades: string[];
  ativo: boolean;
};

export function useAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verifica se é super admin
  const { data: isSuperAdmin = false, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is_super_admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_super_admin");
      if (error) return false;
      return data as boolean;
    },
  });

  // Lista todas as oficinas (só funciona se for admin)
  const oficinasQuery = useQuery({
    queryKey: ["admin_oficinas"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_listar_oficinas");
      if (error) throw error;
      return (data ?? []) as OficinaAdmin[];
    },
  });

  // Lista planos
  const planosQuery = useQuery({
    queryKey: ["planos"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("preco");
      if (error) throw error;
      return (data ?? []) as Plano[];
    },
  });

  // Atualiza status / plano de uma oficina
  const atualizarOficina = useMutation({
    mutationFn: async ({
      oficina_id,
      status,
      plano_id,
      trial_ate,
    }: {
      oficina_id: string;
      status?: string;
      plano_id?: string;
      trial_ate?: string;
    }) => {
      const { error } = await supabase.rpc("admin_atualizar_oficina", {
        p_oficina_id: oficina_id,
        p_status: status ?? undefined,
        p_plano_id: plano_id ?? undefined,
        p_trial_ate: trial_ate ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_oficinas"] });
      toast.success("Oficina atualizada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  // Registrar pagamento (cria assinatura)
  const registrarPagamento = useMutation({
    mutationFn: async ({
      oficina_id,
      plano_id,
      valor_cobrado,
      forma_pagamento,
      observacoes,
      meses = 1,
    }: {
      oficina_id: string;
      plano_id: string;
      valor_cobrado: number;
      forma_pagamento: string;
      observacoes?: string;
      meses?: number;
    }) => {
      const data_fim = new Date();
      data_fim.setMonth(data_fim.getMonth() + meses);

      const { error: assinaturaErr } = await supabase.from("assinaturas").insert({
        oficina_id,
        plano_id,
        status: "ativo",
        valor_cobrado,
        forma_pagamento,
        observacoes,
        data_fim: data_fim.toISOString(),
      });
      if (assinaturaErr) throw assinaturaErr;

      // Ativa a oficina e atualiza o plano
      const { error: oficErr } = await supabase.rpc("admin_atualizar_oficina", {
        p_oficina_id: oficina_id,
        p_status: "ativo",
        p_plano_id: plano_id,
        p_trial_ate: null,
      });
      if (oficErr) throw oficErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_oficinas"] });
      toast.success("Pagamento registrado e oficina ativada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  // Histórico de pagamentos de uma oficina
  const useHistoricoPagamentos = (oficina_id: string) =>
    useQuery({
      queryKey: ["assinaturas", oficina_id],
      enabled: isSuperAdmin && !!oficina_id,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("assinaturas")
          .select("*, planos(nome)")
          .eq("oficina_id", oficina_id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data ?? [];
      },
    });

  return {
    isSuperAdmin,
    isCheckingAdmin,
    oficinas: oficinasQuery.data ?? [],
    isLoadingOficinas: oficinasQuery.isLoading,
    planos: planosQuery.data ?? [],
    atualizarOficina: atualizarOficina.mutateAsync,
    registrarPagamento: registrarPagamento.mutateAsync,
    isUpdating: atualizarOficina.isPending || registrarPagamento.isPending,
    useHistoricoPagamentos,
  };
}
