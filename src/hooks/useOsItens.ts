import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OsItem } from "@/types/database";
import { toast } from "sonner";

export function useOsItens(osId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["os_itens", osId],
    enabled: !!osId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("os_itens")
        .select("*")
        .eq("os_id", osId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as OsItem[];
    },
  });

  const recalculateTotal = async (id: string) => {
      if (!osId) return;
      const { data: itens, error: fetchError } = await supabase
      .from("os_itens")
      .select("total")
      .eq("os_id", id);
    
    if (fetchError) return;

    const newTotal = itens.reduce((acc, it) => acc + (Number(it.total) || 0), 0);

    // Atualiza o valor_total da OS
    await supabase
      .from("ordens_servico")
      .update({ valor_total: newTotal })
      .eq("id", id);
  };

  const addItem = useMutation({
    mutationFn: async (newItem: Omit<OsItem, "id" | "os_id" | "created_at" | "total">) => {
      if (!osId) throw new Error("OS não identificada");
      
      const total = (newItem.quantidade * newItem.preco_unitario) - newItem.desconto;
      
      const { data, error } = await supabase
        .from("os_itens")
        .insert([{ ...newItem, os_id: osId, total }])
        .select()
        .single();

      if (error) throw error;
      
      await recalculateTotal(osId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_itens", osId] });
      queryClient.invalidateQueries({ queryKey: ["order", osId] });
      queryClient.invalidateQueries({ queryKey: ["public_order"] });
      toast.success("Item adicionado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao adicionar item: " + error.message);
    }
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!osId) return;
      const { error } = await supabase
        .from("os_itens")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      await recalculateTotal(osId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_itens", osId] });
      queryClient.invalidateQueries({ queryKey: ["order", osId] });
      queryClient.invalidateQueries({ queryKey: ["public_order"] });
      toast.success("Item removido");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover item: " + error.message);
    }
  });

  return {
    itens: query.data || [],
    isLoading: query.isLoading,
    addItem: addItem.mutateAsync,
    isAdding: addItem.isPending,
    removeItem: removeItem.mutateAsync,
    isRemoving: removeItem.isPending,
  };
}
