import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente } from "@/types/database";
import { toast } from "sonner";

export function useClientes() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const clientesQuery = useQuery({
    queryKey: ["clientes", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      if (!oficinaId) return [];
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          *,
          veiculos(count),
          ordens_servico(count)
        `)
        .eq("oficina_id", oficinaId)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as unknown as (Cliente & { veiculos: { count: number }[]; ordens_servico: { count: number }[] })[];
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (novo: Partial<Cliente>) => {
      if (!oficinaId) throw new Error("Oficina não identificada");
      if (!novo.nome || !novo.telefone) {
        throw new Error("Nome e telefone são obrigatórios");
      }

      const { data, error } = await supabase
        .from("clientes")
        .insert({
          oficina_id: oficinaId,
          nome: novo.nome,
          telefone: novo.telefone,
          email: novo.email ?? null,
          cpf_cnpj: novo.cpf_cnpj ?? null,
          endereco: novo.endereco ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente cadastrado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    },
  });

  return {
    clients: clientesQuery.data ?? [],
    isLoading: clientesQuery.isLoading,
    createClient: createClientMutation.mutateAsync,
  };
}
