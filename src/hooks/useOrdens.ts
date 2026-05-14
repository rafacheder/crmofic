import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkshopId } from "./useWorkshopId";
import { ServiceOrder } from "@/types/database";
import { toast } from "sonner";

export function useOrdens() {
  const workshopId = useWorkshopId();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["orders", workshopId],
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ServiceOrder[];
    },
    enabled: !!workshopId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder: Partial<ServiceOrder>) => {
      if (!workshopId) throw new Error("Workshop ID not found");
      if (!newOrder.client_id || !newOrder.vehicle_id) throw new Error("Cliente e veículo são obrigatórios");
      
      // Get count for sequence
      const { count } = await supabase
        .from("service_orders")
        .select("*", { count: 'exact', head: true })
        .eq("workshop_id", workshopId);
      
      const orderNumber = `OS-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;
      
      const { data, error } = await supabase
        .from("service_orders")
        .insert({
          workshop_id: workshopId,
          client_id: newOrder.client_id,
          vehicle_id: newOrder.vehicle_id,
          column_id: newOrder.column_id,
          order_number: orderNumber,
          status: newOrder.status || 'open',
          priority: newOrder.priority || 'medium',
          description: newOrder.description,
          total_amount: newOrder.total_amount || 0,
          technician_id: newOrder.technician_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["kanban_orders"] });
      toast.success("Ordem de serviço criada");
    },
    onError: (error) => {
      toast.error("Erro ao criar ordem: " + error.message);
    }
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    createOrder: createOrderMutation.mutateAsync,
  };
}
