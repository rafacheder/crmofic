import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Busca a oficina do usuário logado (assumindo que o perfil tem oficina_id ou similar)
  // Como o sistema parece usar multitenancy por RLS, vamos buscar as configurações
  const settingsQuery = useQuery({
    queryKey: ["configuracoes_oficina"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_oficina")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: any) => {
      const { data: existing } = await supabase
        .from("configuracoes_oficina")
        .select("id")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("configuracoes_oficina")
          .update(updates)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Se não existir, precisamos do oficina_id. 
        // Vamos buscar da tabela oficinas onde o usuário é dono ou algo assim.
        // Para simplificar no momento, vamos assumir que existe (foi criado no setup da oficina)
        const { data: oficina } = await supabase.from('oficinas').select('id').maybeSingle();
        if (!oficina) throw new Error("Oficina não encontrada");
        
        const { error } = await supabase
          .from("configuracoes_oficina")
          .insert({ ...updates, oficina_id: oficina.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes_oficina"] });
      toast.success("Configurações atualizadas");
    },
    onError: (e: Error) => toast.error("Erro ao salvar: " + e.message),
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
