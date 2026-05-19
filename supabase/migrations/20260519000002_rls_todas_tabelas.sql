-- ============================================================
-- ROW LEVEL SECURITY - Todas as tabelas portuguesas
-- Cole este conteúdo no Supabase SQL Editor e clique em Run
-- ============================================================

-- Função auxiliar: retorna o oficina_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_oficina_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oficina_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_oficina_id() TO authenticated;

-- ============================================================
-- HABILITAR RLS
-- ============================================================

ALTER TABLE public.oficinas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_colunas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_itens              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_fotos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_historico          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_servicos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_produtos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_mensagem    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacoes_kanban     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_oficina ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- OFICINAS: vê/edita apenas a sua
-- ============================================================

DROP POLICY IF EXISTS "oficinas_select" ON public.oficinas;
DROP POLICY IF EXISTS "oficinas_update" ON public.oficinas;

CREATE POLICY "oficinas_select" ON public.oficinas
  FOR SELECT USING (id = get_oficina_id());

CREATE POLICY "oficinas_update" ON public.oficinas
  FOR UPDATE USING (id = get_oficina_id());

-- ============================================================
-- USUARIOS: vê todos da mesma oficina, edita só o próprio
-- ============================================================

DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;

CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (oficina_id = get_oficina_id());

CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- Tabelas com oficina_id direto
-- ============================================================

DROP POLICY IF EXISTS "kanban_colunas_all"        ON public.kanban_colunas;
DROP POLICY IF EXISTS "clientes_all"              ON public.clientes;
DROP POLICY IF EXISTS "veiculos_all"              ON public.veiculos;
DROP POLICY IF EXISTS "ordens_servico_all"        ON public.ordens_servico;
DROP POLICY IF EXISTS "agendamentos_all"          ON public.agendamentos;
DROP POLICY IF EXISTS "lembretes_all"             ON public.lembretes;
DROP POLICY IF EXISTS "catalogo_servicos_all"     ON public.catalogo_servicos;
DROP POLICY IF EXISTS "catalogo_produtos_all"     ON public.catalogo_produtos;
DROP POLICY IF EXISTS "templates_mensagem_all"    ON public.templates_mensagem;
DROP POLICY IF EXISTS "configuracoes_oficina_all" ON public.configuracoes_oficina;

CREATE POLICY "kanban_colunas_all"        ON public.kanban_colunas        FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "clientes_all"              ON public.clientes               FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "veiculos_all"              ON public.veiculos               FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "ordens_servico_all"        ON public.ordens_servico         FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "agendamentos_all"          ON public.agendamentos           FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "lembretes_all"             ON public.lembretes              FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "catalogo_servicos_all"     ON public.catalogo_servicos      FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "catalogo_produtos_all"     ON public.catalogo_produtos      FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "templates_mensagem_all"    ON public.templates_mensagem     FOR ALL USING (oficina_id = get_oficina_id());
CREATE POLICY "configuracoes_oficina_all" ON public.configuracoes_oficina  FOR ALL USING (oficina_id = get_oficina_id());

-- ============================================================
-- Tabelas filhas (sem oficina_id direto — via JOIN)
-- ============================================================

DROP POLICY IF EXISTS "os_itens_all"          ON public.os_itens;
DROP POLICY IF EXISTS "os_fotos_all"          ON public.os_fotos;
DROP POLICY IF EXISTS "os_historico_all"      ON public.os_historico;
DROP POLICY IF EXISTS "automacoes_kanban_all" ON public.automacoes_kanban;

CREATE POLICY "os_itens_all" ON public.os_itens
  FOR ALL USING (
    os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = get_oficina_id())
  );

CREATE POLICY "os_fotos_all" ON public.os_fotos
  FOR ALL USING (
    os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = get_oficina_id())
  );

CREATE POLICY "os_historico_all" ON public.os_historico
  FOR ALL USING (
    os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = get_oficina_id())
  );

CREATE POLICY "automacoes_kanban_all" ON public.automacoes_kanban
  FOR ALL USING (
    coluna_id IN (SELECT id FROM public.kanban_colunas WHERE oficina_id = get_oficina_id())
  );

-- ============================================================
-- Portal do cliente: leitura pública via token_publico
-- ============================================================

DROP POLICY IF EXISTS "ordens_portal_publico"   ON public.ordens_servico;
DROP POLICY IF EXISTS "os_itens_portal_publico"  ON public.os_itens;
DROP POLICY IF EXISTS "os_fotos_portal_publico"  ON public.os_fotos;

CREATE POLICY "ordens_portal_publico" ON public.ordens_servico
  FOR SELECT USING (token_publico IS NOT NULL);

CREATE POLICY "os_itens_portal_publico" ON public.os_itens
  FOR SELECT USING (
    os_id IN (SELECT id FROM public.ordens_servico WHERE token_publico IS NOT NULL)
  );

CREATE POLICY "os_fotos_portal_publico" ON public.os_fotos
  FOR SELECT USING (
    os_id IN (SELECT id FROM public.ordens_servico WHERE token_publico IS NOT NULL)
  );
