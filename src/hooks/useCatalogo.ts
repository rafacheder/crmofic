import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogoProduto, CatalogoServico } from "@/types/database";
import { toast } from "sonner";

export const CATALOG_SERVICES_KEY = ["catalogo_servicos"];
export const CATALOG_PRODUCTS_KEY = ["catalogo_produtos"];

export function useCatalogo() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const servicosQuery = useQuery({
    queryKey: [...CATALOG_SERVICES_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 5,
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

  // Service Mutations
  const createService = useMutation({
    mutationFn: async (service: Partial<CatalogoServico>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      if (!service.nome) throw new Error("Nome é obrigatório");
      
      const { data, error } = await supabase
        .from("catalogo_servicos")
        .insert([{ ...service, nome: service.nome, oficina_id: oficinaId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_SERVICES_KEY, oficinaId] });
      toast.success("Serviço cadastrado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao cadastrar serviço: " + error.message),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CatalogoServico> & { id: string }) => {
      const { data, error } = await supabase
        .from("catalogo_servicos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_SERVICES_KEY, oficinaId] });
      toast.success("Serviço atualizado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar serviço: " + error.message),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalogo_servicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_SERVICES_KEY, oficinaId] });
      toast.success("Serviço removido");
    },
    onError: (error: Error) => toast.error("Erro ao remover serviço: " + error.message),
  });

  // Product Mutations
  const createProduct = useMutation({
    mutationFn: async (product: Partial<CatalogoProduto>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      if (!product.nome) throw new Error("Nome é obrigatório");

      const { data, error } = await supabase
        .from("catalogo_produtos")
        .insert([{ ...product, nome: product.nome, oficina_id: oficinaId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_PRODUCTS_KEY, oficinaId] });
      toast.success("Produto cadastrado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao cadastrar produto: " + error.message),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CatalogoProduto> & { id: string }) => {
      const { data, error } = await supabase
        .from("catalogo_produtos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_PRODUCTS_KEY, oficinaId] });
      toast.success("Produto atualizado com sucesso");
    },
    onError: (error: Error) => toast.error("Erro ao atualizar produto: " + error.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalogo_produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CATALOG_PRODUCTS_KEY, oficinaId] });
      toast.success("Produto removido");
    },
    onError: (error: Error) => toast.error("Erro ao remover produto: " + error.message),
  });

  return {
    services: servicosQuery.data ?? [],
    products: produtosQuery.data ?? [],
    isLoading: servicosQuery.isLoading || produtosQuery.isLoading,
    createService: createService.mutateAsync,
    updateService: updateService.mutateAsync,
    deleteService: deleteService.mutateAsync,
    createProduct: createProduct.mutateAsync,
    updateProduct: updateProduct.mutateAsync,
    deleteProduct: deleteProduct.mutateAsync,
  };
}
