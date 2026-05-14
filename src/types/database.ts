import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  workshop_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'mechanic';
  created_at: string;
};

export type Workshop = {
  id: string;
  name: string;
  created_at: string;
};

export type KanbanColumn = {
  id: string;
  workshop_id: string;
  name: string;
  position: number;
  color: string;
  is_default: boolean;
};

export type Client = {
  id: string;
  workshop_id: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  address?: string;
  created_at: string;
};

export type Vehicle = {
  id: string;
  workshop_id: string;
  client_id: string;
  brand: string;
  model: string;
  year?: number;
  plate: string;
  color?: string;
  vin?: string;
  created_at: string;
};

export type ServiceOrder = {
  id: string;
  workshop_id: string;
  client_id: string;
  vehicle_id: string;
  column_id: string;
  order_number: string;
  status: 'open' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  total_amount: number;
  technician_id?: string;
  entry_date: string;
  exit_date?: string;
  created_at: string;
  // Joins
  client?: Client;
  vehicle?: Vehicle;
};

export type OrderItem = {
  id: string;
  order_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  type: 'service' | 'product';
};

export type OrderPhoto = {
  id: string;
  order_id: string;
  url: string;
  created_at: string;
};

export type OrderHistory = {
  id: string;
  order_id: string;
  user_id: string;
  from_column_id?: string;
  to_column_id?: string;
  action: string;
  description?: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  workshop_id: string;
  client_id: string;
  vehicle_id: string;
  service_description: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'finished';
  client?: Client;
  vehicle?: Vehicle;
};

export type Reminder = {
  id: string;
  workshop_id: string;
  client_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'active' | 'completed' | 'archived';
  client?: Client;
};

export type CatalogItem = {
  id: string;
  workshop_id: string;
  name: string;
  description?: string;
  price: number;
  type: 'service' | 'product';
  sku?: string;
};

export type MessageTemplate = {
  id: string;
  workshop_id: string;
  name: string;
  content: string;
};

export type KanbanAutomation = {
  id: string;
  column_id: string;
  trigger_type: 'entry' | 'exit' | 'time';
  trigger_value?: number;
  template_id?: string;
};

export type WorkshopSettings = {
  id: string;
  workshop_id: string;
  whaticket_url?: string;
  whaticket_connected: boolean;
  address_header?: string;
  phone_header?: string;
  logo_url?: string;
};
