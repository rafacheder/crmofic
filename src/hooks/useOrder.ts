import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OrdemServico } from "@/types/database";
import { toast } from "sonner";
import { ORDERS_QUERY_KEY } from "./useOrders";

export function useOrder(orderId: string | null) {
  const { oficinaId, user } = useAuth();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          cliente:clientes(*),
          veiculo:veiculos(*),
          itens:os_itens(*),
          historico:os_historico(*, usuario:usuarios(id, nome)),
          fotos:os_fotos(*)
        `)
        .eq("id", orderId)
        .single();
      
      if (error) throw error;
      return data as any; // Cast for joins
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (patch: Partial<OrdemServico>) => {
      if (!orderId) return;
      const { cliente, veiculo, itens, historico, fotos, ...updatePatch } = patch as any;
      const { error } = await supabase
        .from("ordens_servico")
        .update(updatePatch)
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, oficinaId] });
    },
  });

  const moveOrderMutation = useMutation({
    mutationFn: async ({ fromId, toId }: { fromId: string; toId: string }) => {
      if (!orderId) return;
      
      const { error } = await supabase
        .from("ordens_servico")
        .update({ coluna_id: toId })
        .eq("id", orderId);
      
      if (error) throw error;

      await supabase.from("os_historico").insert({
        os_id: orderId,
        usuario_id: user?.id,
        coluna_origem_id: fromId,
        coluna_destino_id: toId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, oficinaId] });
      toast.success("OS movida com sucesso");
    },
  });

  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    updateOrder: updateOrderMutation.mutateAsync,
    moveOrder: moveOrderMutation.mutateAsync,
  };
}
