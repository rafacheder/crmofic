import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente } from "@/types/database";
import { toast } from "sonner";

export const CLIENTS_KEY = ["clientes"];

export function useClientes() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const clientesQuery = useQuery({
    queryKey: [...CLIENTS_KEY, oficinaId],
    enabled: !!oficinaId,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
      return (data ?? []) as any[];
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
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
      toast.success("Cliente cadastrado com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...changes }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes")
        .update(changes)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
      toast.success("Cliente atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
      toast.success("Cliente removido com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover cliente: " + error.message);
    },
  });

  return {
    clients: clientesQuery.data ?? [],
    isLoading: clientesQuery.isLoading,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
}
