import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { cliente_id, oficina_id, veiculo_placa, descricao_problema } = await req.json();

    if (!cliente_id || !oficina_id || !veiculo_placa || !descricao_problema) {
      return new Response(
        JSON.stringify({ 
          sucesso: false, 
          erro: "Os campos cliente_id, oficina_id, veiculo_placa e descricao_problema são obrigatórios" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gera um número no formato WPP- + 6 dígitos aleatórios
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const osNumero = `WPP-${randomDigits}`;
    const reclamacao = `Placa: ${veiculo_placa} | ${descricao_problema}`;

    // Insere na tabela ordens_servico
    // Nota: É importante garantir que a tabela tenha uma coluna_id padrão ou que o fluxo suporte OS sem coluna_id inicial
    const { data, error } = await supabase
      .from("ordens_servico")
      .insert({
        cliente_id,
        oficina_id,
        numero: osNumero,
        reclamacao,
      })
      .select("numero")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: error.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ sucesso: true, os_numero: data.numero }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    console.error("Erro na edge function typebot-criar-os:", err);
    return new Response(
      JSON.stringify({ 
        sucesso: false, 
        erro: err instanceof Error ? err.message : "Erro interno ao processar a requisição" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
