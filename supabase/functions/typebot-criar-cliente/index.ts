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
    const { nome, telefone, oficina_id } = await req.json();

    if (!nome || !telefone || !oficina_id) {
      return new Response(
        JSON.stringify({ 
          sucesso: false, 
          erro: "Os campos nome, telefone e oficina_id são obrigatórios no body" 
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

    const { data, error } = await supabase
      .from("clientes")
      .upsert({
        nome,
        telefone,
        oficina_id,
      }, { 
        onConflict: 'telefone, oficina_id',
        ignoreDuplicates: false 
      })
      .select("id")
      .maybeSingle();

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
      JSON.stringify({ cliente_id: data.id, sucesso: true }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    console.error("Erro na edge function typebot-criar-cliente:", err);
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
