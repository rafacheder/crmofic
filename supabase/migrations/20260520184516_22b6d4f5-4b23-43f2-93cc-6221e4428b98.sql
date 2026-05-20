-- Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('os-fotos', 'os-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'os-fotos');

-- Allow workshop users to upload photos
-- Path format: {oficina_id}/{os_id}/{filename}
CREATE POLICY "Workshop Users Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'os-fotos' 
  AND (storage.foldername(name))[1] = (SELECT oficina_id::text FROM public.usuarios WHERE id = auth.uid())
);

-- Allow workshop users to delete their own photos
CREATE POLICY "Workshop Users Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'os-fotos' 
  AND (storage.foldername(name))[1] = (SELECT oficina_id::text FROM public.usuarios WHERE id = auth.uid())
);
