import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const testEvolutionSchema = z.object({
  url: z.string().url("URL inválida"),
  apiKey: z.string().min(1, "API Key é obrigatória"),
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
});

export const testEvolutionConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => testEvolutionSchema.parse(data))
  .handler(async ({ data }) => {
    const { url, apiKey, instanceName } = data;
    
    // Sanitiza a URL removendo a barra final se existir
    const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    const testUrl = `${baseUrl}/instance/connectionState/${instanceName}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "apikey": apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const result = await response.json();
        const state = result.instance?.state || result.state;
        
        if (state === "open") {
          return { status: "connected", state, message: "Conectado ao WhatsApp" };
        } else {
          return { status: "disconnected", state, message: `Instância em estado: ${state || "desconhecido"}` };
        }
      }

      if (response.status === 401 || response.status === 403) {
        return { status: "error", message: "API Key inválida ou não autorizada" };
      }

      if (response.status === 404) {
        return { status: "error", message: "Instância não encontrada" };
      }

      return { status: "error", message: `Erro na API: status ${response.status}` };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        return { status: "error", message: "Tempo de resposta excedido (Timeout de 8s)" };
      }
      return { status: "error", message: `Falha ao conectar: ${error.message || "Erro de rede"}` };
    }
  });
