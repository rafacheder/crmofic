import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function ChunkErrorHandler() {
  const [errorDetected, setErrorDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const message = "reason" in e ? String(e.reason) : e.message;
      
      // Detecção de erros de carregamento de chunk/módulo
      const isChunkError = 
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Importing a module script failed") ||
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") && message.includes("failed");

      if (isChunkError) {
        console.warn("Detectada falha de carregamento de chunk. Possível nova versão disponível.");
        setErrorDetected(true);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  if (!errorDetected || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin-slow" />
          <p className="text-sm font-medium">
            Uma nova versão do sistema está disponível. Recarregue para continuar navegando.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-foreground text-primary px-3 py-1.5 rounded text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Recarregar agora
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-primary-foreground/10 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}