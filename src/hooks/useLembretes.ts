import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Lembrete } from "@/types/database";

export function useLembretes() {
  const { oficinaId } = useAuth();

  const query = useQuery({
    queryKey: ["lembretes", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("lembretes")
        .select(`
          *,
          cliente:clientes(*)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_agendada", { ascending: true });
      console.log("[useLembretes] lembretes:", data, "erro:", error);
      if (error) throw error;
      return (data ?? []) as unknown as Lembrete[];
    },
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
  };
}
