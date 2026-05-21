import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TemplateMensagem {
  id: string;
  oficina_id: string;
  nome: string;
  canal: string;
  conteudo: string;
  tipo?: string;
  created_at: string;
}

export function useTemplates() {
  const queryClient = useQueryClient();
  const { oficinaId } = useAuth();

  const query = useQuery({
    queryKey: ["templates", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates_mensagem")
        .select("*")
        .eq("oficina_id", oficinaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TemplateMensagem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (novo: Partial<TemplateMensagem>) => {
      const { data, error } = await supabase
        .from("templates_mensagem")
        .insert([{ ...novo, oficina_id: oficinaId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", oficinaId] });
      toast.success("Template criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar template: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (update: Partial<TemplateMensagem> & { id: string }) => {
      const { data, error } = await supabase
        .from("templates_mensagem")
        .update(update)
        .eq("id", update.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", oficinaId] });
      toast.success("Template atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar template: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("templates_mensagem")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", oficinaId] });
      toast.success("Template excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir template: " + error.message);
    },
  });

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
