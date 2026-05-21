
CREATE OR REPLACE FUNCTION public.admin_excluir_oficina(p_oficina_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;

  DELETE FROM public.os_fotos WHERE os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = p_oficina_id);
  DELETE FROM public.os_historico WHERE os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = p_oficina_id);
  DELETE FROM public.os_itens WHERE os_id IN (SELECT id FROM public.ordens_servico WHERE oficina_id = p_oficina_id);
  DELETE FROM public.ordens_servico WHERE oficina_id = p_oficina_id;
  DELETE FROM public.agendamentos WHERE oficina_id = p_oficina_id;
  DELETE FROM public.lembretes WHERE oficina_id = p_oficina_id;
  DELETE FROM public.veiculos WHERE oficina_id = p_oficina_id;
  DELETE FROM public.clientes WHERE oficina_id = p_oficina_id;
  DELETE FROM public.catalogo_servicos WHERE oficina_id = p_oficina_id;
  DELETE FROM public.catalogo_produtos WHERE oficina_id = p_oficina_id;
  DELETE FROM public.templates_mensagem WHERE oficina_id = p_oficina_id;
  DELETE FROM public.automacoes_kanban WHERE coluna_id IN (SELECT id FROM public.kanban_colunas WHERE oficina_id = p_oficina_id);
  DELETE FROM public.kanban_colunas WHERE oficina_id = p_oficina_id;
  DELETE FROM public.configuracoes_oficina WHERE oficina_id = p_oficina_id;
  DELETE FROM public.assinaturas WHERE oficina_id = p_oficina_id;
  DELETE FROM public.usuarios WHERE oficina_id = p_oficina_id;
  DELETE FROM public.oficinas WHERE id = p_oficina_id;
END;
$$;
