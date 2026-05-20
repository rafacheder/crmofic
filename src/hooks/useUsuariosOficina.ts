import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Usuario } from "@/types/database";
import { useServerFn } from "@tanstack/react-start";
import { inviteWorkshopUser } from "@/lib/users.functions";
import { toast } from "sonner";

export function useUsuariosOficina() {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();
  const inviteFn = useServerFn(inviteWorkshopUser);

  const query = useQuery({
    queryKey: ["usuarios_oficina", oficinaId],
    enabled: !!oficinaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("oficina_id", oficinaId as string)
        .order("nome");

      if (error) throw error;
      return data as Usuario[];
    },
  });

  const invite = useMutation({
    mutationFn: (data: { email: string; nome: string; cargo: string }) => inviteFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios_oficina", oficinaId] });
      toast.success("Convite enviado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao convidar: " + error.message);
    }
  });

  const updateUsuario = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Usuario> & { id: string }) => {
      const { error } = await supabase
        .from("usuarios")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios_oficina", oficinaId] });
      toast.success("Usuário atualizado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar usuário: " + error.message);
    }
  });

  const removeUsuario = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios_oficina", oficinaId] });
      toast.success("Usuário removido da oficina");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover usuário: " + error.message);
    }
  });

  return {
    usuarios: query.data || [],
    isLoading: query.isLoading,
    invite: invite.mutateAsync,
    isInviting: invite.isPending,
    updateUsuario: updateUsuario.mutateAsync,
    removeUsuario: removeUsuario.mutateAsync,
  };
}
