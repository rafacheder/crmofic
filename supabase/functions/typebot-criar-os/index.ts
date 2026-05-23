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
    let cliente_id: string | null = null;
    let cliente_nome: string | null = null;
    let oficina_id: string | null = null;
    let veiculo_placa: string | null = null;
    let descricao_problema: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      cliente_id = url.searchParams.get("cliente_id");
      cliente_nome = url.searchParams.get("cliente_nome");
      oficina_id = url.searchParams.get("oficina_id");
      veiculo_placa = url.searchParams.get("veiculo_placa");
      descricao_problema = url.searchParams.get("descricao_problema");
    } else {
      const body = await req.json();
      cliente_id = body.cliente_id ?? null;
      cliente_nome = body.cliente_nome ?? null;
      oficina_id = body.oficina_id ?? null;
      veiculo_placa = body.veiculo_placa ?? null;
      descricao_problema = body.descricao_problema ?? null;
    }

    // Normaliza strings vazias para null
    if (cliente_id === "") cliente_id = null;
    if (cliente_nome === "") cliente_nome = null;

    if (!oficina_id || !veiculo_placa || !descricao_problema) {
      return new Response(
        JSON.stringify({
          sucesso: false,
          erro: "Os campos oficina_id, veiculo_placa e descricao_problema são obrigatórios",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!cliente_id && !cliente_nome) {
      return new Response(
        JSON.stringify({
          sucesso: false,
          erro: "Informe cliente_id ou cliente_nome",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Se cliente_id não veio, buscar pelo nome + oficina
    if (!cliente_id && cliente_nome) {
      const { data: clienteEncontrado, error: buscaError } = await supabase
        .from("clientes")
        .select("id")
        .eq("oficina_id", oficina_id)
        .ilike("nome", cliente_nome)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (buscaError) {
        console.error("Erro ao buscar cliente pelo nome:", buscaError);
        return new Response(
          JSON.stringify({ sucesso: false, erro: `Erro ao buscar cliente: ${buscaError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!clienteEncontrado) {
        return new Response(
          JSON.stringify({
            sucesso: false,
            erro: `Cliente "${cliente_nome}" não encontrado nesta oficina`,
          }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      cliente_id = clienteEncontrado.id;
    }

    // 1. Busca se já existe um veículo com a placa para o cliente
    const { data: veiculo, error: searchError } = await supabase
      .from("veiculos")
      .select("id")
      .eq("placa", veiculo_placa)
      .eq("cliente_id", cliente_id)
      .maybeSingle();

    if (searchError) {
      console.error("Erro ao buscar veículo:", searchError);
    }

    let veiculo_id = veiculo?.id;

    // 2. Se não existir, cria o veículo
    if (!veiculo_id) {
      const { data: newVeiculo, error: insertError } = await supabase
        .from("veiculos")
        .insert({
          placa: veiculo_placa,
          cliente_id,
          oficina_id,
        })
        .select("id")
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: `Erro ao criar veículo: ${insertError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      veiculo_id = newVeiculo.id;
    }

    // Gera um número no formato WPP- + 6 dígitos aleatórios
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const osNumero = `WPP-${randomDigits}`;

    // 3. Ao criar a OS, usa o veiculo_id e salva apenas a descrição
    const { data, error } = await supabase
      .from("ordens_servico")
      .insert({
        cliente_id,
        oficina_id,
        veiculo_id,
        numero: osNumero,
        reclamacao: descricao_problema,
      })
      .select("numero")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ sucesso: true, os_numero: data.numero, cliente_id }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Erro na edge function typebot-criar-os:", err);
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: err instanceof Error ? err.message : "Erro interno ao processar a requisição",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
