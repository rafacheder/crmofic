// Simple in-memory reactive store for demo purposes
import { useSyncExternalStore } from "react";
import {
  orders as initialOrders,
  clients as initialClients,
  vehicles as initialVehicles,
  appointments as initialAppointments,
  reminders as initialReminders,
  services as initialServices,
  products as initialProducts,
  type Order,
  type Client,
  type Vehicle,
  type Appointment,
  type Reminder,
  type CatalogService,
  type CatalogProduct,
  type ColumnId,
  KANBAN_COLUMNS,
  type KanbanAutomation,
} from "./mock-data";

interface State {
  orders: Order[];
  clients: Client[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  reminders: Reminder[];
  services: CatalogService[];
  products: CatalogProduct[];
  columns: typeof KANBAN_COLUMNS;
  whaticketUrl: string;
  whaticketConnected: boolean;
}

let state: State = {
  orders: initialOrders,
  clients: initialClients,
  vehicles: initialVehicles,
  appointments: initialAppointments,
  reminders: initialReminders,
  services: initialServices,
  products: initialProducts,
  columns: KANBAN_COLUMNS,
  whaticketUrl: "",
  whaticketConnected: false,
};

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((l) => l());

export const store = {
  get: () => state,
  set: (partial: Partial<State>) => {
    state = { ...state, ...partial };
    emit();
  },
  moveOrder: (orderId: string, column: ColumnId) => {
    state = {
      ...state,
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              column,
              enteredColumnAt: new Date().toISOString(),
              history: [...o.history, { from: o.column, to: column, by: "Você", at: new Date().toISOString() }],
            }
          : o
      ),
    };
    emit();
  },
  addOrder: (o: Order) => {
    state = { ...state, orders: [o, ...state.orders] };
    emit();
  },
  updateOrder: (id: string, patch: Partial<Order>) => {
    state = { ...state, orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) };
    emit();
  },
  addClient: (c: Client) => {
    state = { ...state, clients: [c, ...state.clients] };
    emit();
  },
  addVehicle: (v: Vehicle) => {
    state = { ...state, vehicles: [v, ...state.vehicles] };
    emit();
  },
  addAppointment: (a: Appointment) => {
    state = { ...state, appointments: [a, ...state.appointments] };
    emit();
  },
  updateAppointment: (id: string, patch: Partial<Appointment>) => {
    state = { ...state, appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) };
    emit();
  },
  addReminder: (r: Reminder) => {
    state = { ...state, reminders: [r, ...state.reminders] };
    emit();
  },
  addService: (s: CatalogService) => {
    state = { ...state, services: [s, ...state.services] };
    emit();
  },
  removeService: (id: string) => {
    state = { ...state, services: state.services.filter((s) => s.id !== id) };
    emit();
  },
  addProduct: (p: CatalogProduct) => {
    state = { ...state, products: [p, ...state.products] };
    emit();
  },
  removeProduct: (id: string) => {
    state = { ...state, products: state.products.filter((p) => p.id !== id) };
    emit();
  },
  updateColumnAutomations: (columnId: ColumnId, automations: KanbanAutomation[]) => {
    state = {
      ...state,
      columns: state.columns.map((c) => (c.id === columnId ? { ...c, automations } : c)),
    };
    emit();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}
