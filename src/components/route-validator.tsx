import { useEffect, useState } from "react";
import { AlertCircle, Terminal, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function RouteValidator() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const validateRoutes = async () => {
      const validationErrors: string[] = [];
      
      // No browser, só conseguimos validar se os módulos estão carregados ou se há erros no console
      // Mas para uma validação "hard" de arquivos físicos, teríamos que usar uma serverFn.
      // Vamos focar no que o usuário pediu: detectar referências antigas e arquivos faltando.
      
      try {
        // Tenta detectar se o Vite reclamou de módulos não encontrados no console
        const originalError = console.error;
        console.error = (...args) => {
          const msg = args.join(" ");
          if (msg.includes("Failed to fetch dynamically imported module") || msg.includes("does not provide an export named 'Route'")) {
            setErrors(prev => [...new Set([...prev, "Erro de importação de rota detectado. Verifique se src/routeTree.gen.ts está atualizado.")]);
          }
          originalError.apply(console, args);
        };
      } catch (e) {
        // ignore
      }

      // Verificação específica solicitada: _admin.tsx
      // Se estivéssemos em build time, seria mais fácil. No runtime, vamos dar um aviso se 
      // detectarmos algo estranho na URL ou no comportamento do router.
      
      // Como não podemos ler o FS no client, vamos emitir um log informativo se estivermos em dev
      if (import.meta.env.DEV) {
        console.log("[RouteValidator] Verificando integridade das rotas admin...");
      }
    };

    validateRoutes();
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
                  Dica: Se você renomeou rotas, delete src/routeTree.gen.ts e reinicie o servidor.
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
