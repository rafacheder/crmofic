import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock das rotas exporta os componentes
// Nota: Em TanStack Router, os componentes costumam ser exportados como 'component' dentro do objeto Route
// mas aqui vamos importar o componente interno por conveniência do smoke test.
import { Route as OficinasRoute } from "../admin.oficinas";
import { Route as PlanosRoute } from "../admin.planos";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

vi.mock("@/hooks/useAdmin", () => ({
  useAdmin: () => ({
    isSuperAdmin: true,
    oficinas: [],
    planos: [],
    isLoadingOficinas: false,
    isUpdating: false,
    upsertPlano: vi.fn(),
    excluirPlano: vi.fn(),
    atualizarOficina: vi.fn(),
    registrarPagamento: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({ component: () => <div>Route</div> }),
}));

describe("Admin Routes Smoke Tests", () => {
  it("deve renderizar a página de oficinas sem quebrar", () => {
    const OficinasComponent = OficinasRoute.options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <OficinasComponent />
      </QueryClientProvider>
    );
    expect(screen.getByText("Oficinas")).toBeInTheDocument();
  });

  it("deve renderizar a página de planos sem quebrar", () => {
    const PlanosComponent = PlanosRoute.options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <PlanosComponent />
      </QueryClientProvider>
    );
    expect(screen.getByText("Planos")).toBeInTheDocument();
  });
});
