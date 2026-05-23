// Follow this setup guide to integrate the Deno runtime into your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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
    let telefone: string | null = null;
    let telefone_digitado: string | null = null;
    let oficina_id: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      telefone = body?.telefone ?? null;
      telefone_digitado = body?.telefone_digitado ?? null;
      oficina_id = body?.oficina_id ?? null;
    } else {
      const url = new URL(req.url);
      telefone = url.searchParams.get("telefone");
      telefone_digitado = url.searchParams.get("telefone_digitado");
      oficina_id = url.searchParams.get("oficina_id");
    }

    if (!oficina_id) {
      return new Response(
        JSON.stringify({ error: "Parâmetro oficina_id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determina qual número usar para busca: telefone principal ou telefone_digitado
    let numeroBusca = "";
    if (telefone && telefone.trim() !== "") {
      numeroBusca = telefone.trim();
    } else if (telefone_digitado && telefone_digitado.trim() !== "") {
      numeroBusca = telefone_digitado.trim();
    }

    // Se nenhum telefone preenchido, retorna encontrado: false sem erro
    if (!numeroBusca) {
      return new Response(
        JSON.stringify({ cliente_id: null, cliente_nome: null, encontrado: false }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Monta variações do número: com e sem 55 na frente
    const telefonesBusca: string[] = [numeroBusca];
    if (numeroBusca.startsWith("55") && numeroBusca.length > 2) {
      telefonesBusca.push(numeroBusca.slice(2));
    } else {
      telefonesBusca.push("55" + numeroBusca);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("oficina_id", oficina_id)
      .in("telefone", telefonesBusca)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    const cliente = data && data.length > 0 ? data[0] : null;

    const response = {
      cliente_id: cliente?.id ?? null,
      cliente_nome: cliente?.nome ?? null,
      encontrado: !!cliente,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Erro na edge function:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
