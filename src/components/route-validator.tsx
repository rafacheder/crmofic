import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function RouteValidator() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args.join(" ");
      if (
        msg.includes("Failed to fetch dynamically imported module") || 
        msg.includes("does not provide an export named 'Route'")
      ) {
        setErrors(prev => [...new Set([...prev, "Erro de importação de rota detectado. Verifique se src/routeTree.gen.ts está atualizado."])]);
      }
      originalError.apply(console, args);
    };

    // Verificação específica para referências obsoletas no desenvolvimento
    if (import.meta.env.DEV) {
      // Pequeno delay para dar tempo do router inicializar
      setTimeout(() => {
        // Se houver algum resquício de pathless layout sendo acessado incorretamente, 
        // o router costuma emitir avisos ou falhar no carregamento.
      }, 1000);
    }

    return () => {
      console.error = originalError;
    };
  }, []);

  if (!isVisible || errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md animate-in fade-in slide-in-from-bottom-4">
      <Alert variant="destructive" className="bg-red-950 border-red-900 text-red-200 shadow-2xl">
        <AlertCircle className="h-4 w-4" />
        <div className="flex justify-between items-start w-full">
          <div>
            <AlertTitle className="font-bold">Aviso de Integridade de Rotas</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              {errors.map((err, i) => (
                <p key={i} className="text-xs leading-relaxed">
                  {err}
                </p>
              ))}
              <div className="mt-3 p-2 bg-black/30 rounded border border-red-800/50">
                <p className="text-[10px] font-mono">
                  Dica: Se você renomeou rotas, delete src/routeTree.gen.ts e reinicie o servidor para limpar o cache do Vite.
                </p>
              </div>
            </AlertDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 -mr-2 -mt-1 hover:bg-red-900/50"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
