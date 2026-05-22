CREATE OR REPLACE FUNCTION public.admin_listar_oficinas()
 RETURNS TABLE(
    id uuid, 
    nome text, 
    email text, 
    telefone text, 
    cnpj text, 
    endereco text, 
    status text, 
    trial_ate timestamp with time zone, 
    plano_id uuid, 
    plano_nome text, 
    plano_preco numeric, 
    typebot_slug text, 
    evolution_api_url text, 
    evolution_api_key text, 
    evolution_instance_name text, 
    total_usuarios bigint, 
    total_ordens bigint, 
    ultima_atividade timestamp with time zone, 
    created_at timestamp with time zone, 
    dono_id uuid, 
    dono_nome text, 
    dono_email text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;

    RETURN QUERY
    SELECT 
        o.id,
        o.nome,
        o.email,
        o.telefone,
        o.cnpj,
        o.endereco,
        o.status,
        o.trial_ate,
        o.plano_id,
        p.nome as plano_nome,
        p.preco as plano_preco,
        o.typebot_slug,
        o.evolution_api_url,
        o.evolution_api_key,
        o.evolution_instance_name,
        (SELECT count(*) FROM public.usuarios u WHERE u.oficina_id = o.id) as total_usuarios,
        (SELECT count(*) FROM public.ordens_servico os WHERE os.oficina_id = o.id) as total_ordens,
        (SELECT max(os.updated_at) FROM public.ordens_servico os WHERE os.oficina_id = o.id) as ultima_atividade,
        o.created_at,
        u_dono.id as dono_id,
        u_dono.nome as dono_nome,
        u_dono.email as dono_email
    FROM 
        public.oficinas o
    LEFT JOIN 
        public.planos p ON o.plano_id = p.id
    LEFT JOIN 
        public.usuarios u_dono ON u_dono.oficina_id = o.id AND u_dono.cargo = 'DONO'
    ORDER BY 
        o.created_at DESC;
END;
$function$;