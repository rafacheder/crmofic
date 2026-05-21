
-- Garantir pgcrypto disponível
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- admin_criar_oficina
-- =========================
CREATE OR REPLACE FUNCTION public.admin_criar_oficina(
  p_nome text,
  p_email text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_cnpj text DEFAULT NULL,
  p_endereco text DEFAULT NULL,
  p_plano_id uuid DEFAULT NULL,
  p_status text DEFAULT 'trial',
  p_dono_nome text DEFAULT NULL,
  p_dono_email text DEFAULT NULL,
  p_dono_senha text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_oficina_id uuid;
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  IF p_dono_email IS NULL OR p_dono_senha IS NULL OR p_dono_nome IS NULL THEN
    RAISE EXCEPTION 'Dados do dono (nome, email, senha) são obrigatórios';
  END IF;
  IF length(p_dono_senha) < 6 THEN
    RAISE EXCEPTION 'Senha deve ter pelo menos 6 caracteres';
  END IF;

  -- Criar usuário em auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_dono_email,
    crypt(p_dono_senha, gen_salt('bf')),
    now(),
    jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
    jsonb_build_object('full_name', p_dono_nome),
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    p_dono_email,
    jsonb_build_object('sub', v_user_id::text, 'email', p_dono_email, 'email_verified', true),
    'email',
    now(), now(), now()
  );

  -- Criar oficina
  INSERT INTO public.oficinas (nome, email, telefone, cnpj, endereco, plano_id, status)
  VALUES (p_nome, p_email, p_telefone, p_cnpj, p_endereco, p_plano_id, COALESCE(p_status, 'trial'))
  RETURNING id INTO v_oficina_id;

  -- Criar usuário público (dono)
  INSERT INTO public.usuarios (id, oficina_id, nome, email, cargo, ativo)
  VALUES (v_user_id, v_oficina_id, p_dono_nome, p_dono_email, 'DONO', true);

  -- Colunas kanban padrão
  INSERT INTO public.kanban_colunas (oficina_id, nome, ordem, cor) VALUES
    (v_oficina_id, 'Recepção', 1, '#94a3b8'),
    (v_oficina_id, 'Diagnóstico', 2, '#3b82f6'),
    (v_oficina_id, 'Aguardando Aprovação', 3, '#f59e0b'),
    (v_oficina_id, 'Aguardando Peças', 4, '#ef4444'),
    (v_oficina_id, 'Em Serviço', 5, '#10b981'),
    (v_oficina_id, 'Controle de Qualidade', 6, '#8b5cf6'),
    (v_oficina_id, 'Pronto para Retirada', 7, '#0ea5e9'),
    (v_oficina_id, 'Entregue', 8, '#64748b');

  RETURN v_oficina_id;
END;
$$;

-- =========================
-- admin_editar_oficina
-- =========================
CREATE OR REPLACE FUNCTION public.admin_editar_oficina(
  p_oficina_id uuid,
  p_nome text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_cnpj text DEFAULT NULL,
  p_endereco text DEFAULT NULL,
  p_plano_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_trial_ate timestamptz DEFAULT NULL,
  p_dono_user_id uuid DEFAULT NULL,
  p_dono_nome text DEFAULT NULL,
  p_dono_email text DEFAULT NULL,
  p_dono_senha text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;

  UPDATE public.oficinas SET
    nome      = COALESCE(p_nome, nome),
    email     = COALESCE(p_email, email),
    telefone  = COALESCE(p_telefone, telefone),
    cnpj      = COALESCE(p_cnpj, cnpj),
    endereco  = COALESCE(p_endereco, endereco),
    plano_id  = COALESCE(p_plano_id, plano_id),
    status    = COALESCE(p_status, status),
    trial_ate = COALESCE(p_trial_ate, trial_ate)
  WHERE id = p_oficina_id;

  IF p_dono_user_id IS NOT NULL THEN
    UPDATE public.usuarios
      SET nome  = COALESCE(p_dono_nome, nome),
          email = COALESCE(p_dono_email, email)
    WHERE id = p_dono_user_id;

    IF p_dono_email IS NOT NULL THEN
      UPDATE auth.users SET email = p_dono_email, updated_at = now() WHERE id = p_dono_user_id;
      UPDATE auth.identities
        SET provider_id = p_dono_email,
            identity_data = jsonb_set(
              jsonb_set(COALESCE(identity_data, '{}'::jsonb), '{email}', to_jsonb(p_dono_email)),
              '{email_verified}', 'true'::jsonb
            ),
            updated_at = now()
      WHERE user_id = p_dono_user_id AND provider = 'email';
    END IF;

    IF p_dono_senha IS NOT NULL AND length(p_dono_senha) >= 6 THEN
      UPDATE auth.users
        SET encrypted_password = crypt(p_dono_senha, gen_salt('bf')),
            updated_at = now()
      WHERE id = p_dono_user_id;
    END IF;
  END IF;
END;
$$;

-- =========================
-- admin_listar_oficinas (extendida)
-- =========================
DROP FUNCTION IF EXISTS public.admin_listar_oficinas();
CREATE OR REPLACE FUNCTION public.admin_listar_oficinas()
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  telefone text,
  cnpj text,
  endereco text,
  status text,
  trial_ate timestamptz,
  plano_id uuid,
  plano_nome text,
  plano_preco numeric,
  total_usuarios bigint,
  total_ordens bigint,
  ultima_atividade timestamptz,
  created_at timestamptz,
  dono_id uuid,
  dono_nome text,
  dono_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY
  SELECT
    o.id, o.nome, o.email, o.telefone, o.cnpj, o.endereco, o.status, o.trial_ate,
    o.plano_id, p.nome, p.preco,
    COUNT(DISTINCT u.id), COUNT(DISTINCT os.id),
    MAX(os.created_at), o.created_at,
    dono.id, dono.nome, dono.email
  FROM public.oficinas o
  LEFT JOIN public.planos p ON p.id = o.plano_id
  LEFT JOIN public.usuarios u ON u.oficina_id = o.id
  LEFT JOIN public.ordens_servico os ON os.oficina_id = o.id
  LEFT JOIN LATERAL (
    SELECT u2.id, u2.nome, u2.email
    FROM public.usuarios u2
    WHERE u2.oficina_id = o.id AND u2.cargo = 'DONO'
    ORDER BY u2.created_at ASC
    LIMIT 1
  ) dono ON true
  GROUP BY o.id, o.nome, o.email, o.telefone, o.cnpj, o.endereco, o.status, o.trial_ate,
           o.plano_id, p.nome, p.preco, o.created_at, dono.id, dono.nome, dono.email
  ORDER BY o.created_at DESC;
END;
$$;
