import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Agendamento } from "@/types/database";

export function useAgendamentos() {
  const { oficinaId } = useAuth();

  const query = useQuery({
    queryKey: ["agendamentos", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          veiculo:veiculos(*)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_hora", { ascending: true });
      console.log("[useAgendamentos] agendamentos:", data, "erro:", error);
      if (error) throw error;
      return (data ?? []) as unknown as Agendamento[];
    },
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
  };
}
