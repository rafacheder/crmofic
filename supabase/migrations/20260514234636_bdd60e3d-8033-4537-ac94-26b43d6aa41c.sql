-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workshops Table
CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles Table (Usuario)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Kanban Columns
CREATE TABLE public.kanban_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  document TEXT, -- CPF/CNPJ
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate TEXT NOT NULL,
  color TEXT,
  vin TEXT, -- Chassis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Service Orders (OrdemServico)
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  column_id UUID REFERENCES public.kanban_columns(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL,
  priority TEXT DEFAULT 'medium' NOT NULL,
  description TEXT,
  total_amount DECIMAL(12,2) DEFAULT 0,
  technician_id UUID REFERENCES public.profiles(id),
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Order Items (OsItem)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(12,2) DEFAULT 1 NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  type TEXT DEFAULT 'service' NOT NULL, -- service or product
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Order Photos (OsFoto)
CREATE TABLE public.order_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Order History (OsHistorico)
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_column_id UUID REFERENCES public.kanban_columns(id),
  to_column_id UUID REFERENCES public.kanban_columns(id),
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Appointments (Agendamento)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  service_description TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Reminders (Lembrete)
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Catalog Items (Serviço/Produto)
CREATE TABLE public.catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL, -- service or product
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Message Templates
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Kanban Automations
CREATE TABLE public.kanban_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID REFERENCES public.kanban_columns(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL, -- entry, exit, time
  trigger_value INTEGER, -- for time trigger
  template_id UUID REFERENCES public.message_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Workshop Settings
CREATE TABLE public.workshop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID UNIQUE REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  whaticket_url TEXT,
  whaticket_connected BOOLEAN DEFAULT false,
  address_header TEXT,
  phone_header TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES --

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_settings ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Workshop isolation for Profiles (exception)
CREATE POLICY "Users can only access their own profile" 
ON public.profiles FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view others in their workshop" 
ON public.profiles FOR SELECT USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));

-- Workshop isolation policies
CREATE POLICY "Workshop isolation for kanban_columns" ON public.kanban_columns FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for clients" ON public.clients FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for vehicles" ON public.vehicles FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for service_orders" ON public.service_orders FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for appointments" ON public.appointments FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for reminders" ON public.reminders FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for catalog_items" ON public.catalog_items FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for message_templates" ON public.message_templates FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Workshop isolation for workshop_settings" ON public.workshop_settings FOR ALL USING (workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));

-- Policy for workshops (users can see their own workshop)
CREATE POLICY "Users can see their workshop" ON public.workshops FOR SELECT USING (id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid()));

-- Sub-table isolation (orders-related)
CREATE POLICY "Order isolation for items" ON public.order_items FOR ALL USING (order_id IN (SELECT id FROM public.service_orders WHERE workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Order isolation for photos" ON public.order_photos FOR ALL USING (order_id IN (SELECT id FROM public.service_orders WHERE workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Order isolation for history" ON public.order_history FOR ALL USING (order_id IN (SELECT id FROM public.service_orders WHERE workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid())));

-- Column isolation for automations
CREATE POLICY "Column isolation for automations" ON public.kanban_automations FOR ALL USING (column_id IN (SELECT id FROM public.kanban_columns WHERE workshop_id = (SELECT workshop_id FROM public.profiles WHERE id = auth.uid())));

-- RPC FUNCTION: criar_oficina_e_usuario
CREATE OR REPLACE FUNCTION public.criar_oficina_e_usuario(
  nome_oficina TEXT,
  nome_usuario TEXT,
  p_email TEXT,
  p_user_id UUID
) RETURNS void AS $$
DECLARE
  v_workshop_id UUID;
BEGIN
  -- 1. Create workshop
  INSERT INTO public.workshops (name) VALUES (nome_oficina) RETURNING id INTO v_workshop_id;
  
  -- 2. Create profile
  INSERT INTO public.profiles (id, workshop_id, full_name, email, role)
  VALUES (p_user_id, v_workshop_id, nome_usuario, p_email, 'admin');

  -- 3. Create default Kanban columns
  INSERT INTO public.kanban_columns (workshop_id, name, position, color, is_default)
  VALUES 
    (v_workshop_id, 'Recepção', 1, '#94a3b8', true),
    (v_workshop_id, 'Diagnóstico', 2, '#3b82f6', true),
    (v_workshop_id, 'Aguardando Aprovação', 3, '#f59e0b', true),
    (v_workshop_id, 'Aguardando Peças', 4, '#ef4444', true),
    (v_workshop_id, 'Em Serviço', 5, '#10b981', true),
    (v_workshop_id, 'Controle de Qualidade', 6, '#8b5cf6', true),
    (v_workshop_id, 'Pronto para Retirada', 7, '#0ea5e9', true),
    (v_workshop_id, 'Entregue', 8, '#64748b', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- TIMESTAMPS TRIGGER --
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_workshops_modtime BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_vehicles_modtime BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON public.workshop_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
