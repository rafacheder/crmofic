import { Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "./ui/skeleton";

export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
