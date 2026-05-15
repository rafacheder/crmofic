import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogoProduto, CatalogoServico } from "@/types/database";

export function useCatalogo() {
  const { oficinaId } = useAuth();

  const servicosQuery = useQuery({
    queryKey: ["catalogo_servicos", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("catalogo_servicos")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("nome");
      console.log("[useCatalogo] servicos:", data, "erro:", error);
      if (error) throw error;
      return (data ?? []) as unknown as CatalogoServico[];
    },
  });

  const produtosQuery = useQuery({
    queryKey: ["catalogo_produtos", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("catalogo_produtos")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("nome");
      console.log("[useCatalogo] produtos:", data, "erro:", error);
      if (error) throw error;
      return (data ?? []) as unknown as CatalogoProduto[];
    },
  });

  return {
    services: servicosQuery.data ?? [],
    products: produtosQuery.data ?? [],
    isLoading: servicosQuery.isLoading || produtosQuery.isLoading,
  };
}
