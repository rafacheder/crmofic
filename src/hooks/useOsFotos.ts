import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { OsFoto } from "@/types/database";
import { toast } from "sonner";

export function useOsFotos(osId: string | null) {
  const { oficinaId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["os_fotos", osId],
    enabled: !!osId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("os_fotos")
        .select("*")
        .eq("os_id", osId as string)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OsFoto[];
    },
  });

  const uploadFoto = useMutation({
    mutationFn: async (file: File) => {
      if (!osId || !oficinaId) throw new Error("OS ou Oficina não identificada");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${oficinaId}/${osId}/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("os-fotos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("os-fotos")
        .getPublicUrl(filePath);

      // 3. Insert into Database
      const { data, error: dbError } = await supabase
        .from("os_fotos")
        .insert([{ os_id: osId, url: publicUrl }])
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_fotos", osId] });
      queryClient.invalidateQueries({ queryKey: ["public_order"] });
      toast.success("Foto enviada com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar foto: " + error.message);
    }
  });

  const removeFoto = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      // 1. Extract path from URL
      // URL format is usually .../storage/v1/object/public/os-fotos/oficina_id/os_id/filename
      const pathPart = url.split("/os-fotos/")[1];
      if (!pathPart) throw new Error("Caminho do arquivo não identificado na URL");

      // 2. Remove from Storage
      const { error: storageError } = await supabase.storage
        .from("os-fotos")
        .remove([pathPart]);

      if (storageError) throw storageError;

      // 3. Remove from Database
      const { error: dbError } = await supabase
        .from("os_fotos")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["os_fotos", osId] });
      queryClient.invalidateQueries({ queryKey: ["public_order"] });
      toast.success("Foto removida");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover foto: " + error.message);
    }
  });

  return {
    fotos: query.data || [],
    isLoading: query.isLoading,
    uploadFoto: uploadFoto.mutateAsync,
    isUploading: uploadFoto.isPending,
    removeFoto: removeFoto.mutateAsync,
    isRemoving: removeFoto.isPending,
  };
}
