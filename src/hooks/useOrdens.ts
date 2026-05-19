import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrdemServico } from "@/types/database";
import { toast } from "sonner";

export function useOrdens() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const ordensQuery = useQuery({
    queryKey: ["ordens_servico", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          cliente:clientes(*),
          veiculo:veiculos(*)
        `)
        .eq("oficina_id", oficinaId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (nova: Partial<OrdemServico>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      if (!nova.cliente_id || !nova.veiculo_id) {
        throw new Error("Cliente e veículo são obrigatórios");
      }

      const { count, error: countErr } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("oficina_id", oficinaId);
      if (countErr) throw countErr;

      const numero = `OS-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, "0")}`;

      const payload = {
        oficina_id: oficinaId,
        numero,
        cliente_id: nova.cliente_id,
        veiculo_id: nova.veiculo_id,
        coluna_id: nova.coluna_id ?? null,
        tecnico_id: nova.tecnico_id ?? null,
        prioridade: nova.prioridade ?? "NORMAL",
        status_orcamento: nova.status_orcamento ?? "PENDENTE",
        reclamacao: nova.reclamacao ?? null,
        observacoes: nova.observacoes ?? null,
        valor_total: nova.valor_total ?? 0,
        km_entrada: nova.km_entrada ?? null,
        data_agendada: nova.data_agendada ?? null,
      };

      const { data, error } = await supabase
        .from("ordens_servico")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      queryClient.invalidateQueries({ queryKey: ["kanban_ordens"] });
      toast.success("Ordem de serviço criada");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar ordem: " + error.message);
    },
  });

  return {
    orders: ordensQuery.data ?? [],
    isLoading: ordensQuery.isLoading,
    createOrder: createOrderMutation.mutateAsync,
  };
}
