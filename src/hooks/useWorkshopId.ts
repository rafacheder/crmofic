import { useAuth } from "@/contexts/AuthContext";

/** @deprecated Use `useOficinaId()` instead. Kept for backwards compatibility. */
export function useWorkshopId() {
  const { oficinaId } = useAuth();
  return oficinaId;
}

export function useOficinaId() {
  const { oficinaId } = useAuth();
  return oficinaId;
}
