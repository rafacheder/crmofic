-- Adicionar colunas de configuração da Evolution API
ALTER TABLE public.oficinas 
ADD COLUMN IF NOT EXISTS evolution_api_url TEXT,
ADD COLUMN IF NOT EXISTS evolution_api_key TEXT,
ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT;

-- Remover funções existentes sem especificar argumentos detalhados (usando CASCADE ou nome simples se único)
-- Nota: Para funções com sobrecarga, precisamos ser específicos ou usar DROP FUNCTION nome.
DROP FUNCTION IF EXISTS public.admin_listar_oficinas();

-- Recriar função de listar oficinas
CREATE OR REPLACE FUNCTION public.admin_listar_oficinas()
RETURNS TABLE (
    id UUID,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    cnpj TEXT,
    endereco TEXT,
    status TEXT,
    trial_ate TIMESTAMPTZ,
    plano_id UUID,
    plano_nome TEXT,
    plano_preco NUMERIC,
    typebot_slug TEXT,
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    evolution_instance_name TEXT,
    total_usuarios BIGINT,
    total_ordens BIGINT,
    ultima_atividade TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    dono_id UUID,
    dono_nome TEXT,
    dono_email TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
        (SELECT count(*) FROM usuarios u WHERE u.oficina_id = o.id) as total_usuarios,
        (SELECT count(*) FROM ordens_servico os WHERE os.oficina_id = o.id) as total_ordens,
        (SELECT max(os.updated_at) FROM ordens_servico os WHERE os.oficina_id = o.id) as ultima_atividade,
        o.created_at,
        u_dono.id as dono_id,
        u_dono.nome as dono_nome,
        u_dono.email as dono_email
    FROM 
        oficinas o
    LEFT JOIN 
        planos p ON o.plano_id = p.id
    LEFT JOIN 
        usuarios u_dono ON u_dono.oficina_id = o.id AND u_dono.role = 'dono'
    ORDER BY 
        o.created_at DESC;
END;
$$;

-- Recriar função de editar oficina (usando parâmetros nomeados para evitar conflito de tipos)
CREATE OR REPLACE FUNCTION public.admin_editar_oficina(
    p_oficina_id UUID,
    p_nome TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_telefone TEXT DEFAULT NULL,
    p_cnpj TEXT DEFAULT NULL,
    p_endereco TEXT DEFAULT NULL,
    p_plano_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_trial_ate TIMESTAMPTZ DEFAULT NULL,
    p_typebot_slug TEXT DEFAULT NULL,
    p_evolution_api_url TEXT DEFAULT NULL,
    p_evolution_api_key TEXT DEFAULT NULL,
    p_evolution_instance_name TEXT DEFAULT NULL,
    p_dono_user_id UUID DEFAULT NULL,
    p_dono_nome TEXT DEFAULT NULL,
    p_dono_email TEXT DEFAULT NULL,
    p_dono_senha TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;

    UPDATE oficinas SET
        nome = COALESCE(p_nome, nome),
        email = COALESCE(p_email, email),
        telefone = COALESCE(p_telefone, telefone),
        cnpj = COALESCE(p_cnpj, cnpj),
        endereco = COALESCE(p_endereco, endereco),
        plano_id = COALESCE(p_plano_id, plano_id),
        status = COALESCE(p_status, status),
        trial_ate = COALESCE(p_trial_ate, trial_ate),
        typebot_slug = COALESCE(p_typebot_slug, typebot_slug),
        evolution_api_url = COALESCE(p_evolution_api_url, evolution_api_url),
        evolution_api_key = COALESCE(p_evolution_api_key, evolution_api_key),
        evolution_instance_name = COALESCE(p_evolution_instance_name, evolution_instance_name)
    WHERE id = p_oficina_id;

    IF p_dono_user_id IS NOT NULL THEN
        UPDATE usuarios SET
            nome = COALESCE(p_dono_nome, nome),
            email = COALESCE(p_dono_email, email)
        WHERE id = p_dono_user_id;
    END IF;
END;
$$;
