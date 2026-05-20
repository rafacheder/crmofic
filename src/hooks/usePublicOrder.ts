import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrdemServico, OsItem, OsHistorico, OsFoto } from "@/types/database";
import { toast } from "sonner";

export function usePublicOrder(token: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["public_order", token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          cliente:clientes(*),
          veiculo:veiculos(*),
          itens:os_itens(*),
          historico:os_historico(*),
          fotos:os_fotos(*)
        `)
        .eq("token_publico", token)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Ordem de serviço não encontrada");
      
      return data as unknown as OrdemServico & { 
        itens: OsItem[], 
        historico: OsHistorico[],
        fotos: OsFoto[]
      };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: "APROVADO" | "RECUSADO") => {
      if (!query.data?.id) return;
      const { error } = await supabase
        .from("ordens_servico")
        .update({ status_orcamento: status })
        .eq("id", query.data.id);
      
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["public_order", token] });
      toast.success(status === "APROVADO" ? "Orçamento aprovado!" : "Orçamento recusado.");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar orçamento: " + error.message);
    }
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    error: query.error,
    approve: () => updateStatus.mutateAsync("APROVADO"),
    refuse: () => updateStatus.mutateAsync("RECUSADO"),
    isUpdating: updateStatus.isPending,
  };
}
