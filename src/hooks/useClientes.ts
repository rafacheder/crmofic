import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkshopId } from "./useWorkshopId";
import { Client } from "@/types/database";
import { toast } from "sonner";

export function useClientes() {
  const workshopId = useWorkshopId();
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients", workshopId],
    queryFn: async () => {
      if (!workshopId) return [];
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          vehicles(count),
          service_orders(count)
        `)
        .eq("workshop_id", workshopId)
        .order("name");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workshopId,
  });

  const createClientMutation = useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      if (!workshopId) throw new Error("Workshop ID not found");
      if (!newClient.name || !newClient.phone) throw new Error("Nome e telefone são obrigatórios");

      const { data, error } = await supabase
        .from("clients")
        .insert({ 
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          document: newClient.document,
          address: newClient.address,
          workshop_id: workshopId 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente cadastrado");
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    createClient: createClientMutation.mutateAsync,
  };
}
