import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Agendamento } from "@/types/database";
import { toast } from "sonner";

const APPOINTMENTS_KEY = ["agendamentos"];

export function useAgendamentos() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...APPOINTMENTS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          id,
          data_hora,
          status,
          observacoes,
          servicos,
          cliente:clientes(id, nome),
          veiculo:veiculos(id, placa, marca, modelo)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_hora", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Agendamento[];
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (payload: Partial<Agendamento>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      const { data, error } = await supabase
        .from("agendamentos")
        .insert([{ ...payload, oficina_id: oficinaId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_KEY, oficinaId] });
      toast.success("Agendamento criado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao criar agendamento: " + error.message),
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agendamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_KEY, oficinaId] });
    },
    onError: (error: Error) => toast.error("Erro ao atualizar agendamento: " + error.message),
  });

  const deleteAgendamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_KEY, oficinaId] });
      toast.success("Agendamento removido");
    },
    onError: (error: Error) => toast.error("Erro ao remover agendamento: " + error.message),
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
    createAgendamento: createAgendamento.mutateAsync,
    updateAgendamento: updateAgendamento.mutateAsync,
    deleteAgendamento: deleteAgendamento.mutateAsync,
  };
}
