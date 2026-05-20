import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Agendamento } from "@/types/database";

const APPOINTMENTS_KEY = ["agendamentos"];

export function useAgendamentos() {
  const { oficinaId } = useAuth();

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
          descricao,
          cliente:clientes(id, nome),
          veiculo:veiculos(id, placa, marca, modelo)
        `)
        .eq("oficina_id", oficinaId)
        .order("data_hora", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Agendamento[];
    },
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
  };
}
