REVOKE EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text,text,text,uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text,text,text,uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text,text,text,uuid) FROM authenticated;

-- Allow service_role to execute (backend/system calls)
GRANT EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text,text,text,uuid) TO service_role;
