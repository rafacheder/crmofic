import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanColuna, OrdemServico } from "@/types/database";
import { toast } from "sonner";

export function useKanban() {
  const { oficinaId, user } = useAuth();
  const queryClient = useQueryClient();

  const colunasQuery = useQuery({
    queryKey: ["kanban_colunas", oficinaId],
    enabled: !!oficinaId,
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
    queryKey: ["kanban_ordens", oficinaId],
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

      const { error: updErr } = await supabase
        .from("ordens_servico")
        .update({ coluna_id: toColunaId })
        .eq("id", ordemId)
        .eq("oficina_id", oficinaId);
      if (updErr) throw updErr;

      const { error: histErr } = await supabase
        .from("os_historico")
        .insert({
          os_id: ordemId,
          usuario_id: user?.id ?? null,
          coluna_origem_id: fromColunaId,
          coluna_destino_id: toColunaId,
        });
      if (histErr) throw histErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban_ordens"] });
      toast.success("Ordem movida com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao mover ordem: " + error.message);
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
