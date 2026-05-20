import React, { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<LayoutSkeleton />}>
            <PrivateRoute />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  );
}

function LayoutSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full hidden md:block" />
        <Skeleton className="h-[400px] w-full hidden md:block" />
      </div>
    </div>
  );
}
