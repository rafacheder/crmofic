CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.admin_criar_oficina(p_nome text, p_email text DEFAULT NULL::text, p_telefone text DEFAULT NULL::text, p_cnpj text DEFAULT NULL::text, p_endereco text DEFAULT NULL::text, p_plano_id uuid DEFAULT NULL::uuid, p_status text DEFAULT 'trial'::text, p_dono_nome text DEFAULT NULL::text, p_dono_email text DEFAULT NULL::text, p_dono_senha text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
    extensions.crypt(p_dono_senha, extensions.gen_salt('bf')),
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

  INSERT INTO public.oficinas (nome, email, telefone, cnpj, endereco, plano_id, status)
  VALUES (p_nome, p_email, p_telefone, p_cnpj, p_endereco, p_plano_id, COALESCE(p_status, 'trial'))
  RETURNING id INTO v_oficina_id;

  INSERT INTO public.usuarios (id, oficina_id, nome, email, cargo, ativo)
  VALUES (v_user_id, v_oficina_id, p_dono_nome, p_dono_email, 'DONO', true);

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
$function$;

CREATE OR REPLACE FUNCTION public.admin_editar_oficina(p_oficina_id uuid, p_nome text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_telefone text DEFAULT NULL::text, p_cnpj text DEFAULT NULL::text, p_endereco text DEFAULT NULL::text, p_plano_id uuid DEFAULT NULL::uuid, p_status text DEFAULT NULL::text, p_trial_ate timestamp with time zone DEFAULT NULL::timestamp with time zone, p_dono_user_id uuid DEFAULT NULL::uuid, p_dono_nome text DEFAULT NULL::text, p_dono_email text DEFAULT NULL::text, p_dono_senha text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
        SET encrypted_password = extensions.crypt(p_dono_senha, extensions.gen_salt('bf')),
            updated_at = now()
      WHERE id = p_dono_user_id;
    END IF;
  END IF;
END;
$function$;