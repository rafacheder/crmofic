
-- 1. Enable RLS on clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 2. Drop anon webhook insert policies (typebot edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS clientes_insert_webhook ON public.clientes;
DROP POLICY IF EXISTS clientes_insert ON public.clientes;
DROP POLICY IF EXISTS os_insert_webhook ON public.ordens_servico;

-- 3. Drop overly permissive public portal policies
DROP POLICY IF EXISTS ordens_portal_publico ON public.ordens_servico;
DROP POLICY IF EXISTS os_itens_portal_publico ON public.os_itens;
DROP POLICY IF EXISTS os_fotos_portal_publico ON public.os_fotos;

-- 4. Secure RPC for public portal access (requires real token)
CREATE OR REPLACE FUNCTION public.get_public_order(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_os public.ordens_servico%ROWTYPE;
  v_result jsonb;
BEGIN
  IF p_token IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_os FROM public.ordens_servico WHERE token_publico = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'os', to_jsonb(v_os),
    'cliente', (SELECT to_jsonb(c) FROM public.clientes c WHERE c.id = v_os.cliente_id),
    'veiculo', (SELECT to_jsonb(v) FROM public.veiculos v WHERE v.id = v_os.veiculo_id),
    'itens', COALESCE((SELECT jsonb_agg(to_jsonb(i)) FROM public.os_itens i WHERE i.os_id = v_os.id), '[]'::jsonb),
    'historico', COALESCE((SELECT jsonb_agg(to_jsonb(h)) FROM public.os_historico h WHERE h.os_id = v_os.id), '[]'::jsonb),
    'fotos', COALESCE((SELECT jsonb_agg(to_jsonb(f)) FROM public.os_fotos f WHERE f.os_id = v_os.id), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_public_order_status(p_token uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_token IS NULL OR p_status NOT IN ('APROVADO', 'RECUSADO') THEN
    RETURN false;
  END IF;

  UPDATE public.ordens_servico
  SET status_orcamento = p_status
  WHERE token_publico = p_token;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_order(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.update_public_order_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_public_order_status(uuid, text) TO anon, authenticated;

-- 5. Storage: drop broad public listing/select; public bucket URLs still serve files directly via CDN
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

-- 6. Fix mutable search_path on trigger function
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- 7. Tighten EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_listar_oficinas() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_criar_oficina(text, text, text, text, text, uuid, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_editar_oficina(uuid, text, text, text, text, text, uuid, text, timestamp with time zone, uuid, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_atualizar_oficina(uuid, text, uuid, timestamp with time zone) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_excluir_oficina(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text, text, text, uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.admin_listar_oficinas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_criar_oficina(text, text, text, text, text, uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_editar_oficina(uuid, text, text, text, text, text, uuid, text, timestamp with time zone, uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_atualizar_oficina(uuid, text, uuid, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_excluir_oficina(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text, text, text, uuid) TO authenticated;
