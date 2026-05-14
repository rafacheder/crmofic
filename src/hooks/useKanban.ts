import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkshopId } from "./useWorkshopId";
import { KanbanColumn, ServiceOrder } from "@/types/database";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useKanban() {
  const workshopId = useWorkshopId();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const columnsQuery = useQuery({
    queryKey: ["kanban_columns", workshopId],
    queryFn: async () => {
      if (!workshopId) return [];
      const { data, error } = await supabase
        .from("kanban_columns")
        .select("*")
        .eq("workshop_id", workshopId)
        .order("position");
      if (error) throw error;
      return data as KanbanColumn[];
    },
    enabled: !!workshopId,
  });

  const ordersQuery = useQuery({
    queryKey: ["kanban_orders", workshopId],
    queryFn: async () => {
      if (!workshopId) return [];
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          client:clients(*),
          vehicle:vehicles(*)
        `)
        .eq("workshop_id", workshopId)
        .neq("status", "closed");
      if (error) throw error;
      return data as ServiceOrder[];
    },
    enabled: !!workshopId,
  });

  const moveCardMutation = useMutation({
    mutationFn: async ({ orderId, fromColumnId, toColumnId }: { orderId: string, fromColumnId: string, toColumnId: string }) => {
      if (!workshopId) throw new Error("Workshop ID not found");
      // 1. Update order column
      const { error: updateError } = await supabase
        .from("service_orders")
        .update({ column_id: toColumnId })
        .eq("id", orderId);
      if (updateError) throw updateError;

      // 2. Log history
      const { error: historyError } = await supabase
        .from("order_history")
        .insert({
          order_id: orderId,
          user_id: profile?.id,
          from_column_id: fromColumnId,
          to_column_id: toColumnId,
          action: "move",
          description: "Movido entre colunas"
        });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban_orders"] });
      toast.success("Ordem movida com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao mover ordem: " + error.message);
    }
  });

  return {
    columns: columnsQuery.data || [],
    orders: ordersQuery.data || [],
    isLoading: columnsQuery.isLoading || ordersQuery.isLoading,
    moveCard: (orderId: string, fromColumnId: string, toColumnId: string) => 
      moveCardMutation.mutate({ orderId, fromColumnId, toColumnId })
  };
}
