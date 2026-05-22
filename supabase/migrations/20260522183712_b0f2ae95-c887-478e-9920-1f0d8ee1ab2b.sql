-- Criar bucket de avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Policy para visualização pública
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Policy para upload (cada usuário na sua pasta)
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy para delete (cada usuário na sua pasta)
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Atualizar trigger de updated_at para garantir que existe em perfis se necessário
-- (A tabela usuarios já existe e tem RLS, mas vamos conferir se o usuário pode atualizar a si mesmo)
-- A policy 'usuarios_update' já existe: (id = auth.uid())
