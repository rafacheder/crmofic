-- ============================================================
-- SUPER ADMIN - Painel de gestão master
-- ============================================================

-- 1. Planos disponíveis
CREATE TABLE IF NOT EXISTS public.planos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT NOT NULL,                    -- Trial / Básico / Pro / Enterprise
  preco        NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite_usuarios   INTEGER DEFAULT 3,
  limite_ordens_mes INTEGER DEFAULT 100,         -- NULL = ilimitado
  funcionalidades   JSONB DEFAULT '[]',          -- ["kanban","lembretes","portal","whatsapp"]
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. Status e assinatura das oficinas
ALTER TABLE public.oficinas
  ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'trial',  -- trial | ativo | suspenso | cancelado
  ADD COLUMN IF NOT EXISTS plano_id     UUID REFERENCES public.planos(id),
  ADD COLUMN IF NOT EXISTS trial_ate    TIMESTAMPTZ DEFAULT (now() + interval '14 days');

-- 3. Assinaturas (histórico de pagamentos e planos)
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id     UUID NOT NULL REFERENCES public.oficinas(id) ON DELETE CASCADE,
  plano_id       UUID NOT NULL REFERENCES public.planos(id),
  status         TEXT NOT NULL DEFAULT 'ativo',  -- ativo | suspenso | cancelado | trial
  valor_cobrado  NUMERIC(10,2) DEFAULT 0,
  data_inicio    TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_fim       TIMESTAMPTZ,
  forma_pagamento TEXT,                           -- pix | boleto | cartao | manual
  observacoes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 4. Super admins
CREATE TABLE IF NOT EXISTS public.super_admins (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FUNÇÃO: checa se o usuário atual é super admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ============================================================
-- RLS para tabelas de admin
-- ============================================================

ALTER TABLE public.planos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Planos: qualquer autenticado lê (para mostrar pricing); só admin escreve
CREATE POLICY "planos_select"  ON public.planos FOR SELECT TO authenticated USING (true);
CREATE POLICY "planos_admin"   ON public.planos FOR ALL USING (is_super_admin());

-- Assinaturas: oficina vê a própria; admin vê todas
CREATE POLICY "assinaturas_oficina" ON public.assinaturas
  FOR SELECT USING (oficina_id = get_oficina_id());
CREATE POLICY "assinaturas_admin" ON public.assinaturas
  FOR ALL USING (is_super_admin());

-- Super admins: só admin gerencia
CREATE POLICY "super_admins_admin" ON public.super_admins
  FOR ALL USING (is_super_admin());

-- Oficinas: admin vê e edita todas
CREATE POLICY "oficinas_admin" ON public.oficinas
  FOR ALL USING (is_super_admin());

-- ============================================================
-- PLANOS PADRÃO
-- ============================================================

INSERT INTO public.planos (nome, preco, limite_usuarios, limite_ordens_mes, funcionalidades) VALUES
  ('Trial',      0,     2,    50,   '["kanban","clientes","veiculos","ordens"]'),
  ('Básico',     97,    3,    200,  '["kanban","clientes","veiculos","ordens","lembretes","agendamentos"]'),
  ('Pro',        197,   10,   NULL, '["kanban","clientes","veiculos","ordens","lembretes","agendamentos","portal","whatsapp","catalogo","automacoes"]'),
  ('Enterprise', 397,   NULL, NULL, '["kanban","clientes","veiculos","ordens","lembretes","agendamentos","portal","whatsapp","catalogo","automacoes","api","relatorios"]')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FUNÇÃO RPC: admin lista todas as oficinas com estatísticas
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_listar_oficinas()
RETURNS TABLE (
  id            UUID,
  nome          TEXT,
  email         TEXT,
  telefone      TEXT,
  status        TEXT,
  trial_ate     TIMESTAMPTZ,
  plano_nome    TEXT,
  plano_preco   NUMERIC,
  total_usuarios   BIGINT,
  total_ordens     BIGINT,
  ultima_atividade TIMESTAMPTZ,
  created_at    TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    o.status,
    o.trial_ate,
    p.nome        AS plano_nome,
    p.preco       AS plano_preco,
    COUNT(DISTINCT u.id)  AS total_usuarios,
    COUNT(DISTINCT os.id) AS total_ordens,
    MAX(os.created_at)    AS ultima_atividade,
    o.created_at
  FROM public.oficinas o
  LEFT JOIN public.planos p    ON p.id = o.plano_id
  LEFT JOIN public.usuarios u  ON u.oficina_id = o.id
  LEFT JOIN public.ordens_servico os ON os.oficina_id = o.id
  GROUP BY o.id, o.nome, o.email, o.telefone, o.status, o.trial_ate, p.nome, p.preco, o.created_at
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_listar_oficinas() TO authenticated;

-- ============================================================
-- FUNÇÃO RPC: admin atualiza status de uma oficina
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_atualizar_oficina(
  p_oficina_id UUID,
  p_status     TEXT DEFAULT NULL,
  p_plano_id   UUID DEFAULT NULL,
  p_trial_ate  TIMESTAMPTZ DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.oficinas SET
    status    = COALESCE(p_status,    status),
    plano_id  = COALESCE(p_plano_id,  plano_id),
    trial_ate = COALESCE(p_trial_ate, trial_ate)
  WHERE id = p_oficina_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_atualizar_oficina(UUID, TEXT, UUID, TIMESTAMPTZ) TO authenticated;
