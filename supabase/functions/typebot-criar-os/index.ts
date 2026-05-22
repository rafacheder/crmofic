import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let cliente_id, oficina_id, veiculo_placa, descricao_problema;

    if (req.method === "GET") {
      const url = new URL(req.url);
      cliente_id = url.searchParams.get("cliente_id");
      oficina_id = url.searchParams.get("oficina_id");
      veiculo_placa = url.searchParams.get("veiculo_placa");
      descricao_problema = url.searchParams.get("descricao_problema");
    } else {
      const body = await req.json();
      cliente_id = body.cliente_id;
      oficina_id = body.oficina_id;
      veiculo_placa = body.veiculo_placa;
      descricao_problema = body.descricao_problema;
    }

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