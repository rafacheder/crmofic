import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrdemServico } from "@/types/database";
import { toast } from "sonner";

const ORDERS_KEY = ["ordens_servico"];

export function useOrdens() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const ordensQuery = useQuery({
    queryKey: [...ORDERS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          id,
          numero,
          cliente_id,
          veiculo_id,
          coluna_id,
          prioridade,
          status_orcamento,
          valor_total,
          created_at,
          km_entrada,
          data_agendada,
          cliente:clientes(id, nome),
          veiculo:veiculos(id, placa, marca, modelo)
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

      // Using RPC for atomic number generation if possible, but keeping current logic with optimization
      const { count, error: countErr } = await supabase
        .from("ordens_servico")
        .select("id", { count: "exact", head: true })
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
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
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
