import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogoProduto, CatalogoServico } from "@/types/database";

const CATALOG_SERVICES_KEY = ["catalogo_servicos"];
const CATALOG_PRODUCTS_KEY = ["catalogo_produtos"];

export function useCatalogo() {
  const { oficinaId } = useAuth();

  const servicosQuery = useQuery({
    queryKey: [...CATALOG_SERVICES_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 30, // 30 minutes for catalog
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("catalogo_servicos")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as unknown as CatalogoServico[];
    },
  });

  const produtosQuery = useQuery({
    queryKey: [...CATALOG_PRODUCTS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("catalogo_produtos")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("nome");
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
