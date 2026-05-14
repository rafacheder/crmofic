export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type BudgetStatus = "PENDENTE" | "ENVIADO" | "APROVADO" | "RECUSADO";
export type ColumnId =
  | "recepcao"
  | "diagnostico"
  | "aprovacao"
  | "pecas"
  | "execucao"
  | "qualidade"
  | "pronto"
  | "entregue";

export interface KanbanColumn {
  id: ColumnId;
  name: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "recepcao", name: "Recepção", color: "#94a3b8" },
  { id: "diagnostico", name: "Diagnóstico", color: "#06b6d4" },
  { id: "aprovacao", name: "Aguardando Aprovação", color: "#f59e0b" },
  { id: "pecas", name: "Aguardando Peças", color: "#a855f7" },
  { id: "execucao", name: "Em Execução", color: "#3b82f6" },
  { id: "qualidade", name: "Controle de Qualidade", color: "#8b5cf6" },
  { id: "pronto", name: "Pronto p/ Retirada", color: "#10b981" },
  { id: "entregue", name: "Entregue", color: "#64748b" },
];

export interface Vehicle {
  id: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel: "Gasolina" | "Etanol" | "Flex" | "Diesel" | "Elétrico" | "Híbrido";
  km: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  doc: string;
  email: string;
  phone: string;
  address?: string;
  birthday?: string;
  tags?: string[];
}

export interface CatalogService {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  active: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface OrderItem {
  id: string;
  type: "service" | "product";
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

export interface Order {
  id: string;
  number: string;
  clientId: string;
  vehicleId: string;
  column: ColumnId;
  priority: Priority;
  budgetStatus: BudgetStatus;
  technician: string;
  technicianAvatar?: string;
  total: number;
  tags: string[];
  complaint: string;
  kmIn: number;
  scheduledAt?: string;
  notes?: string;
  enteredColumnAt: string;
  createdAt: string;
  items: OrderItem[];
  history: { from: ColumnId | null; to: ColumnId; by: string; at: string }[];
  photos: string[];
}

export const clients: Client[] = [
  { id: "c1", name: "João da Silva", doc: "123.456.789-00", email: "joao@email.com", phone: "(11) 98888-1111", address: "Rua A, 100", birthday: "1985-04-12", tags: ["VIP"] },
  { id: "c2", name: "Maria Oliveira", doc: "987.654.321-00", email: "maria@email.com", phone: "(11) 97777-2222", address: "Rua B, 200", birthday: "1990-09-23" },
  { id: "c3", name: "Pedro Souza", doc: "456.789.123-00", email: "pedro@email.com", phone: "(11) 96666-3333", address: "Rua C, 300", birthday: "1978-12-05" },
];

export const vehicles: Vehicle[] = [
  { id: "v1", clientId: "c1", plate: "ABC-1D23", brand: "Toyota", model: "Corolla", year: 2020, color: "Prata", fuel: "Flex", km: 45000 },
  { id: "v2", clientId: "c2", plate: "XYZ-9A87", brand: "Honda", model: "Civic", year: 2019, color: "Preto", fuel: "Flex", km: 62000 },
  { id: "v3", clientId: "c3", plate: "DEF-4G56", brand: "Ford", model: "Ka", year: 2018, color: "Branco", fuel: "Flex", km: 78000 },
  { id: "v4", clientId: "c1", plate: "GHI-7J89", brand: "VW", model: "Gol", year: 2017, color: "Vermelho", fuel: "Flex", km: 95000 },
];

export const services: CatalogService[] = [
  { id: "s1", name: "Troca de Óleo", category: "Manutenção", price: 89.9, duration: 30, active: true },
  { id: "s2", name: "Alinhamento", category: "Suspensão", price: 79.9, duration: 45, active: true },
  { id: "s3", name: "Balanceamento", category: "Suspensão", price: 59.9, duration: 30, active: true },
  { id: "s4", name: "Revisão Completa", category: "Manutenção", price: 299.9, duration: 180, active: true },
  { id: "s5", name: "Troca de Filtro de Ar", category: "Manutenção", price: 49.9, duration: 20, active: true },
];

export const products: CatalogProduct[] = [
  { id: "p1", name: "Óleo 5W30 Sintético 1L", sku: "OL-5W30", price: 45.0, stock: 24, minStock: 10, unit: "L" },
  { id: "p2", name: "Filtro de Óleo Universal", sku: "FO-001", price: 28.0, stock: 8, minStock: 10, unit: "un" },
  { id: "p3", name: "Filtro de Ar", sku: "FA-002", price: 35.0, stock: 15, minStock: 5, unit: "un" },
  { id: "p4", name: "Pastilha de Freio Dianteira", sku: "PF-D01", price: 120.0, stock: 6, minStock: 4, unit: "par" },
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const orders: Order[] = [
  {
    id: "o1", number: "OS-2024-0001", clientId: "c1", vehicleId: "v1",
    column: "execucao", priority: "NORMAL", budgetStatus: "APROVADO",
    technician: "Carlos M.", total: 449.8, tags: ["Revisão"],
    complaint: "Cliente solicitou revisão completa de 45.000km",
    kmIn: 45000, enteredColumnAt: hoursAgo(2.5), createdAt: hoursAgo(26),
    items: [
      { id: "i1", type: "service", name: "Revisão Completa", qty: 1, unitPrice: 299.9, discount: 0 },
      { id: "i2", type: "service", name: "Troca de Óleo", qty: 1, unitPrice: 89.9, discount: 0 },
      { id: "i3", type: "product", name: "Óleo 5W30 Sintético 1L", qty: 4, unitPrice: 45.0, discount: 60 },
    ],
    history: [
      { from: null, to: "recepcao", by: "Ana R.", at: hoursAgo(26) },
      { from: "recepcao", to: "diagnostico", by: "Ana R.", at: hoursAgo(24) },
      { from: "diagnostico", to: "aprovacao", by: "Carlos M.", at: hoursAgo(20) },
      { from: "aprovacao", to: "execucao", by: "Carlos M.", at: hoursAgo(2.5) },
    ],
    photos: [],
  },
  {
    id: "o2", number: "OS-2024-0002", clientId: "c2", vehicleId: "v2",
    column: "aprovacao", priority: "HIGH", budgetStatus: "ENVIADO",
    technician: "Bruno L.", total: 299.9, tags: ["Revisão", "Urgente"],
    complaint: "Barulho na suspensão dianteira",
    kmIn: 62000, enteredColumnAt: hoursAgo(5), createdAt: hoursAgo(8),
    items: [{ id: "i4", type: "service", name: "Revisão Completa", qty: 1, unitPrice: 299.9, discount: 0 }],
    history: [
      { from: null, to: "recepcao", by: "Ana R.", at: hoursAgo(8) },
      { from: "recepcao", to: "diagnostico", by: "Bruno L.", at: hoursAgo(7) },
      { from: "diagnostico", to: "aprovacao", by: "Bruno L.", at: hoursAgo(5) },
    ],
    photos: [],
  },
  {
    id: "o3", number: "OS-2024-0003", clientId: "c3", vehicleId: "v3",
    column: "diagnostico", priority: "URGENT", budgetStatus: "PENDENTE",
    technician: "Carlos M.", total: 89.9, tags: ["Diagnóstico"],
    complaint: "Carro não dá partida",
    kmIn: 78000, enteredColumnAt: hoursAgo(1), createdAt: hoursAgo(2),
    items: [{ id: "i5", type: "service", name: "Troca de Óleo", qty: 1, unitPrice: 89.9, discount: 0 }],
    history: [
      { from: null, to: "recepcao", by: "Ana R.", at: hoursAgo(2) },
      { from: "recepcao", to: "diagnostico", by: "Carlos M.", at: hoursAgo(1) },
    ],
    photos: [],
  },
];

export interface Appointment {
  id: string;
  datetime: string;
  clientId: string;
  vehicleId: string;
  services: string[];
  status: "PENDENTE" | "CONFIRMADO" | "EM ANDAMENTO" | "CONCLUÍDO" | "CANCELADO" | "NÃO COMPARECEU";
}

export const appointments: Appointment[] = [
  { id: "a1", datetime: new Date(now + 86400000).toISOString(), clientId: "c1", vehicleId: "v1", services: ["Troca de Óleo"], status: "CONFIRMADO" },
  { id: "a2", datetime: new Date(now + 2 * 86400000).toISOString(), clientId: "c2", vehicleId: "v2", services: ["Alinhamento", "Balanceamento"], status: "PENDENTE" },
  { id: "a3", datetime: new Date(now + 3 * 86400000).toISOString(), clientId: "c3", vehicleId: "v3", services: ["Revisão Completa"], status: "PENDENTE" },
];

export interface Reminder {
  id: string;
  type: "Troca de Óleo" | "Revisão Geral" | "Rodízio" | "Alinhamento" | "Filtro" | "Aniversário" | "Personalizado";
  clientId: string;
  vehicleId?: string;
  channel: "WhatsApp" | "Email" | "SMS";
  scheduledAt?: string;
  targetKm?: number;
  status: "PENDENTE" | "ENVIADO" | "FALHOU" | "CANCELADO";
}

export const reminders: Reminder[] = [
  { id: "r1", type: "Troca de Óleo", clientId: "c1", vehicleId: "v1", channel: "WhatsApp", targetKm: 50000, status: "PENDENTE" },
  { id: "r2", type: "Aniversário", clientId: "c2", channel: "WhatsApp", scheduledAt: new Date(now + 5 * 86400000).toISOString(), status: "PENDENTE" },
  { id: "r3", type: "Revisão Geral", clientId: "c3", vehicleId: "v3", channel: "Email", scheduledAt: new Date(now - 86400000).toISOString(), status: "ENVIADO" },
];

export const clientById = (id: string) => clients.find((c) => c.id === id);
export const vehicleById = (id: string) => vehicles.find((v) => v.id === id);
export const vehiclesByClient = (id: string) => vehicles.filter((v) => v.clientId === id);
export const ordersByClient = (id: string) => orders.filter((o) => o.clientId === id);

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  NORMAL: { label: "Normal", className: "bg-primary/15 text-primary" },
  HIGH: { label: "Alta", className: "bg-warning/20 text-warning-foreground" },
  URGENT: { label: "Urgente", className: "bg-destructive/15 text-destructive" },
};

export const budgetMeta: Record<BudgetStatus, { className: string }> = {
  PENDENTE: { className: "bg-muted text-muted-foreground" },
  ENVIADO: { className: "bg-warning/20 text-warning-foreground" },
  APROVADO: { className: "bg-success/15 text-success" },
  RECUSADO: { className: "bg-destructive/15 text-destructive" },
};

export function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h < 24) return `${h}h ${mm}min`;
  return `${Math.floor(h / 24)}d`;
}

export function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
