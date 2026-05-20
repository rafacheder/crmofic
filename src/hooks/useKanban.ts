import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanColuna, OrdemServico } from "@/types/database";
import { toast } from "sonner";

const KANBAN_COLUMNS_KEY = ["kanban_colunas"];
const KANBAN_ORDERS_KEY = ["kanban_ordens"];

export function useKanban() {
  const { oficinaId, user } = useAuth();
  const queryClient = useQueryClient();

  const colunasQuery = useQuery({
    queryKey: [...KANBAN_COLUMNS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 60, // 1 hour for columns as they change rarely
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("kanban_colunas")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("ordem");
      if (error) throw error;
      return (data ?? []) as unknown as KanbanColuna[];
    },
  });

  const ordensQuery = useQuery({
    queryKey: [...KANBAN_ORDERS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
          cliente:clientes(id, nome),
          veiculo:veiculos(id, placa, marca, modelo)
        `)
        .eq("oficina_id", oficinaId);
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: async ({
      ordemId, fromColunaId, toColunaId,
    }: { ordemId: string; fromColunaId: string; toColunaId: string }) => {
      if (!oficinaId) throw new Error("Oficina não identificada");

      // Optimistic update check
      const { error: updErr } = await supabase
        .from("ordens_servico")
        .update({ coluna_id: toColunaId })
        .eq("id", ordemId)
        .eq("oficina_id", oficinaId);
      if (updErr) throw updErr;

      // History insertion is secondary
      supabase
        .from("os_historico")
        .insert({
          os_id: ordemId,
          usuario_id: user?.id ?? null,
          coluna_origem_id: fromColunaId,
          coluna_destino_id: toColunaId,
        }).then(({ error }) => {
          if (error) console.error("Erro ao registrar histórico:", error);
        });
    },
    onMutate: async ({ ordemId, toColunaId }) => {
      await queryClient.cancelQueries({ queryKey: [...KANBAN_ORDERS_KEY, oficinaId] });
      const previousOrders = queryClient.getQueryData([...KANBAN_ORDERS_KEY, oficinaId]);
      
      queryClient.setQueryData([...KANBAN_ORDERS_KEY, oficinaId], (old: OrdemServico[] | undefined) => {
        if (!old) return old;
        return old.map(order => 
          order.id === ordemId ? { ...order, coluna_id: toColunaId } : order
        );
      });

      return { previousOrders };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData([...KANBAN_ORDERS_KEY, oficinaId], context.previousOrders);
      }
      toast.error("Erro ao mover ordem: " + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...KANBAN_ORDERS_KEY, oficinaId] });
    },
  });

  return {
    columns: colunasQuery.data ?? [],
    orders: ordensQuery.data ?? [],
    isLoading: colunasQuery.isLoading || ordensQuery.isLoading,
    moveCard: (ordemId: string, fromColunaId: string, toColunaId: string) =>
      moveCardMutation.mutate({ ordemId, fromColunaId, toColunaId }),
  };
}
