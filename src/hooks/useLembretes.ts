import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Lembrete } from "@/types/database";
import { toast } from "sonner";

const REMINDERS_KEY = ["lembretes"];

export function useLembretes() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...REMINDERS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("lembretes")
        .select(`
          id,
          tipo,
          status,
          canal,
          data_agendada,
          km_alvo,
          mensagem,
          veiculo_id,
          cliente_id,
          cliente:clientes(id, nome)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_agendada", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Lembrete[];
    },
  });

  const createLembrete = useMutation({
    mutationFn: async (payload: Partial<Lembrete>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      const { data, error } = await supabase
        .from("lembretes")
        .insert([{ ...payload, oficina_id: oficinaId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REMINDERS_KEY, oficinaId] });
      toast.success("Lembrete criado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao criar lembrete: " + error.message),
  });

  const deleteLembrete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lembretes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REMINDERS_KEY, oficinaId] });
      toast.success("Lembrete removido");
    },
    onError: (error: Error) => toast.error("Erro ao remover lembrete: " + error.message),
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
    createLembrete: createLembrete.mutateAsync,
    deleteLembrete: deleteLembrete.mutateAsync,
  };
}
