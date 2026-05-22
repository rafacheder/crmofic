import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrdemServico, OsItem, OsHistorico, OsFoto, Cliente, Veiculo } from "@/types/database";
import { toast } from "sonner";

type PublicOrderPayload = {
  os: OrdemServico;
  cliente: Cliente | null;
  veiculo: Veiculo | null;
  itens: OsItem[] | null;
  historico: OsHistorico[] | null;
  fotos: OsFoto[] | null;
};

export function usePublicOrder(token: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["public_order", token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_order", { p_token: token });

      if (error) throw error;
      if (!data) throw new Error("Ordem de serviço não encontrada");

      const payload = data as unknown as PublicOrderPayload;

      return {
        ...payload.os,
        cliente: payload.cliente ?? undefined,
        veiculo: payload.veiculo ?? undefined,
        itens: payload.itens ?? [],
        historico: payload.historico ?? [],
        fotos: payload.fotos ?? [],
      } as unknown as OrdemServico & {
        itens: OsItem[];
        historico: OsHistorico[];
        fotos: OsFoto[];
      };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: "APROVADO" | "RECUSADO") => {
      const { error } = await supabase.rpc("update_public_order_status", {
        p_token: token,
        p_status: status,
      });

      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["public_order", token] });
      toast.success(status === "APROVADO" ? "Orçamento aprovado!" : "Orçamento recusado.");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar orçamento: " + error.message);
    },
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
