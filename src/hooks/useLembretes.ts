import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Lembrete } from "@/types/database";

const REMINDERS_KEY = ["lembretes"];

export function useLembretes() {
  const { oficinaId } = useAuth();

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
          cliente:clientes(id, nome)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_agendada", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Lembrete[];
    },
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
  };
}
