import { render, screen } from "@testing-library/react";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { vi, describe, it, expect } from "vitest";

// Mocks
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useRouterState: vi.fn(() => "/kanban"),
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signOut: vi.fn(),
  }),
}));

const mockIsSuperAdmin = vi.fn();
vi.mock("@/hooks/useAdmin", () => ({
  useAdmin: () => ({
    isSuperAdmin: mockIsSuperAdmin(),
  }),
}));

describe("AppSidebar", () => {
  it("não deve mostrar o menu de administração para usuários comuns", () => {
    mockIsSuperAdmin.mockReturnValue(false);
    
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
    
    expect(screen.queryByText("Administração")).not.toBeInTheDocument();
    expect(screen.queryByText("Oficinas")).not.toBeInTheDocument();
    expect(screen.queryByText("Planos")).not.toBeInTheDocument();
  });

  it("deve mostrar o menu de administração para super admins", () => {
    mockIsSuperAdmin.mockReturnValue(true);
    
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
    
    expect(screen.getByText("Administração")).toBeInTheDocument();
    expect(screen.getByText("Oficinas")).toBeInTheDocument();
    expect(screen.getByText("Planos")).toBeInTheDocument();
    
    const oficinasLink = screen.getByText("Oficinas").closest("a");
    expect(oficinasLink).toHaveAttribute("href", "/admin/oficinas");
  });
});
