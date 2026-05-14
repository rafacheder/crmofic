import { useAuth } from "@/contexts/AuthContext";

export function useWorkshopId() {
  const { profile } = useAuth();
  return profile?.workshop_id;
}
