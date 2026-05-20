import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export function AppErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center text-muted-foreground">
          <AlertTriangle size={48} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ocorreu um erro inesperado. Você pode tentar recarregar os dados ou voltar para a página inicial.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Voltar ao início
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 text-left">
            <p className="text-xs font-mono text-muted-foreground bg-muted p-4 rounded overflow-auto max-h-40">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}