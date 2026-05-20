import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Veiculo } from "@/types/database";
import { toast } from "sonner";

export const VEHICLES_KEY = ["veiculos"];

export function useVehicles(clienteId?: string | null) {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: [...VEHICLES_KEY, oficinaId, clienteId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      let query = supabase
        .from("veiculos")
        .select("*")
        .eq("oficina_id", oficinaId);
      
      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query.order("placa");
      if (error) throw error;
      return (data ?? []) as Veiculo[];
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (novo: Partial<Veiculo>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      if (!novo.cliente_id) throw new Error("Cliente não identificado");
      if (!novo.placa) throw new Error("Placa é obrigatória");

      const { data, error } = await supabase
        .from("veiculos")
        .insert({
          ...novo,
          placa: novo.placa as string, // Ensure type safety for required field
          oficina_id: oficinaId,
        })

        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      toast.success("Veículo cadastrado com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar veículo: " + error.message);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, ...changes }: Partial<Veiculo> & { id: string }) => {
      const { data, error } = await supabase
        .from("veiculos")
        .update(changes)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      toast.success("Veículo atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar veículo: " + error.message);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("veiculos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      toast.success("Veículo removido com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover veículo: " + error.message);
    },
  });

  return {
    vehicles: vehiclesQuery.data ?? [],
    isLoading: vehiclesQuery.isLoading,
    createVehicle: createVehicleMutation.mutateAsync,
    updateVehicle: updateVehicleMutation.mutateAsync,
    deleteVehicle: deleteVehicleMutation.mutateAsync,
    isCreating: createVehicleMutation.isPending,
    isUpdating: updateVehicleMutation.isPending,
    isDeleting: deleteVehicleMutation.isPending,
  };
}
