-- Drop English-named tables (CASCADE drops policies/FKs)
DROP TABLE IF EXISTS public.order_history CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.order_photos CASCADE;
DROP TABLE IF EXISTS public.kanban_automations CASCADE;
DROP TABLE IF EXISTS public.service_orders CASCADE;
DROP TABLE IF EXISTS public.kanban_columns CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.catalog_items CASCADE;
DROP TABLE IF EXISTS public.message_templates CASCADE;
DROP TABLE IF EXISTS public.workshop_settings CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.workshops CASCADE;

-- Ensure usuarios.id is linked to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='usuarios' AND constraint_name='usuarios_id_fkey'
  ) THEN
    ALTER TABLE public.usuarios
      ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Replace RPC to use Portuguese tables
CREATE OR REPLACE FUNCTION public.criar_oficina_e_usuario(
  nome_oficina text, nome_usuario text, p_email text, p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_oficina_id UUID;
BEGIN
  INSERT INTO public.oficinas (nome) VALUES (nome_oficina) RETURNING id INTO v_oficina_id;

  INSERT INTO public.usuarios (id, oficina_id, nome, email, cargo, ativo)
  VALUES (p_user_id, v_oficina_id, nome_usuario, p_email, 'DONO', true);

  INSERT INTO public.kanban_colunas (oficina_id, nome, ordem, cor) VALUES
    (v_oficina_id, 'Recepção', 1, '#94a3b8'),
    (v_oficina_id, 'Diagnóstico', 2, '#3b82f6'),
    (v_oficina_id, 'Aguardando Aprovação', 3, '#f59e0b'),
    (v_oficina_id, 'Aguardando Peças', 4, '#ef4444'),
    (v_oficina_id, 'Em Serviço', 5, '#10b981'),
    (v_oficina_id, 'Controle de Qualidade', 6, '#8b5cf6'),
    (v_oficina_id, 'Pronto para Retirada', 7, '#0ea5e9'),
    (v_oficina_id, 'Entregue', 8, '#64748b');
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_oficina_e_usuario(text, text, text, uuid) TO anon, authenticated;