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
    let nome, telefone, oficina_id;

    if (req.method === "GET") {
      const url = new URL(req.url);
      nome = url.searchParams.get("nome");
      telefone = url.searchParams.get("telefone");
      oficina_id = url.searchParams.get("oficina_id");
    } else {
      const body = await req.json();
      nome = body.nome;
      telefone = body.telefone;
      oficina_id = body.oficina_id;
    }

    if (!nome || !telefone || !oficina_id) {
      return new Response(
        JSON.stringify({ 
          sucesso: false, 
          erro: "Os campos nome, telefone e oficina_id são obrigatórios" 
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

    // Primeiro, verifica se o cliente já existe para esta oficina
    const { data: existingClient, error: searchError } = await supabase
      .from("clientes")
      .select("id")
      .eq("telefone", telefone)
      .eq("oficina_id", oficina_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (searchError) throw searchError;

    let resultId;
    
    if (existingClient) {
      // Atualiza o nome do cliente existente
      const { data, error: updateError } = await supabase
        .from("clientes")
        .update({ nome })
        .eq("id", existingClient.id)
        .select("id")
        .single();
        
      if (updateError) throw updateError;
      resultId = data.id;
    } else {
      // Insere novo cliente
      const { data, error: insertError } = await supabase
        .from("clientes")
        .insert({ nome, telefone, oficina_id })
        .select("id")
        .single();
        
      if (insertError) throw insertError;
      resultId = data.id;
    }

    return new Response(
      JSON.stringify({ cliente_id: resultId, sucesso: true }),
      {
        status: 201, // 201 Created
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