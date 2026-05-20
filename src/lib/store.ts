// Simple in-memory reactive store for remaining UI state
import { useSyncExternalStore } from "react";
import {
  appointments as initialAppointments,
  reminders as initialReminders,
  services as initialServices,
  products as initialProducts,
  type Appointment,
  type Reminder,
  type CatalogService,
  type CatalogProduct,
  type ColumnId,
  KANBAN_COLUMNS,
  type KanbanAutomation,
} from "./mock-data";

interface State {
  appointments: Appointment[];
  reminders: Reminder[];
  services: CatalogService[];
  products: CatalogProduct[];
  columns: typeof KANBAN_COLUMNS;
  whaticketUrl: string;
  whaticketConnected: boolean;
}

let state: State = {
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
  addClient: (c: any) => {
    // Clients now handled by Supabase, but keeping stub for UI consistency if needed
    console.warn("addClient is deprecated. Use database directly.");
    emit();
  },
  addVehicle: (v: any) => {
    console.warn("addVehicle is deprecated. Use database directly.");
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
