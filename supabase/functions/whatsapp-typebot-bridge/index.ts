// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function extractText(message: any): string | null {
  if (!message) return null;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedDisplayText ||
    message.listResponseMessage?.title ||
    null
  );
}

async function sendEvolutionMessage(params: {
  url: string;
  apiKey: string;
  instance: string;
  number: string;
  text: string;
}) {
  const base = params.url.endsWith("/") ? params.url.slice(0, -1) : params.url;
  const endpoint = `${base}/message/sendText/${params.instance}`;
  console.log(`[Evolution] Sending message to ${params.number} via ${endpoint}`);
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: params.apiKey,
    },
    body: JSON.stringify({
      number: params.number,
      text: params.text,
      options: { delay: 800, presence: "composing" },
    }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Evolution] Send error (${res.status}):`, errorText);
  } else {
    console.log(`[Evolution] Message sent successfully to ${params.number}`);
  }
}

async function typebotChat(params: {
  typebotUrl: string;
  typebotSlug: string;
  sessionId: string;
  message: string;
}): Promise<string[]> {
  const base = params.typebotUrl.endsWith("/")
    ? params.typebotUrl.slice(0, -1)
    : params.typebotUrl;

  const startUrl = `${base}/api/v1/typebots/${params.typebotSlug}/startChat`;
  console.log(`[Typebot] Calling ${startUrl} for session ${params.sessionId}`);
  
  const startRes = await fetch(startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      sessionId: params.sessionId,
      isStreamEnabled: false,
      isOnlyRegistering: false,
    }),
  });

  if (!startRes.ok) {
    const errorText = await startRes.text();
    console.error(`[Typebot] Error (${startRes.status}):`, errorText);
    return [];
  }

  const data = await startRes.json();
  const messages = data.messages || [];
  const texts: string[] = [];
  
  for (const m of messages) {
    if (m.type === "text") {
      const rich = m.content?.richText;
      if (Array.isArray(rich)) {
        const flat = rich
          .map((b: any) =>
            (b.children || [])
              .map((c: any) =>
                (c.children || []).map((t: any) => t.text || "").join("")
              )
              .join("")
          )
          .filter(Boolean)
          .join("\n");
        if (flat) texts.push(flat);
      } else if (m.content?.plainText) {
        texts.push(m.content.plainText);
      }
    }
  }
  
  console.log(`[Typebot] Received ${texts.length} text responses`);
  return texts;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("[Bridge] Received payload:", JSON.stringify(payload, null, 2));
    
    const event: string = payload.event || payload.type || "";
    console.log(`[Bridge] Event type: ${event}`);

    if (event.toUpperCase() !== "MESSAGES_UPSERT") {
      console.log(`[Bridge] Ignoring non-MESSAGES_UPSERT event: ${event}`);
      return new Response(JSON.stringify({ ignored: "event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = payload.data || payload;
    const message = data.message;
    const key = data.key || {};

    if (!message) {
      console.log("[Bridge] Ignoring payload without message");
      return new Response(JSON.stringify({ ignored: "no message" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (key.fromMe === true) {
      console.log("[Bridge] Ignoring message from me");
      return new Response(JSON.stringify({ ignored: "fromMe" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remoteJid: string = key.remoteJid || "";
    if (!remoteJid || remoteJid.endsWith("@g.us")) {
      console.log(`[Bridge] Ignoring group or invalid JID: ${remoteJid}`);
      return new Response(JSON.stringify({ ignored: "group or no jid" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const sender = remoteJid.replace("@s.whatsapp.net", "");
    const instanceName: string = payload.instance || data.instance || payload.instanceName || "";

    console.log(`[Bridge] Processing message from ${sender} (Instance: ${instanceName})`);

    if (!instanceName) {
      console.error("[Bridge] Error: instanceName not found in payload");
      return new Response(JSON.stringify({ error: "instance not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lookup workshop by evolution_instance_name
    console.log(`[Database] Looking up oficina for instance: ${instanceName}`);
    const { data: oficina, error: ofErr } = await supabase
      .from("oficinas")
      .select("id, typebot_slug, evolution_api_url, evolution_api_key, evolution_instance_name")
      .eq("evolution_instance_name", instanceName)
      .maybeSingle();

    if (ofErr) {
      console.error("[Database] Error looking up oficina:", ofErr);
      return new Response(JSON.stringify({ error: "db error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!oficina) {
      console.error(`[Bridge] Error: Oficina not found for instance ${instanceName}`);
      return new Response(JSON.stringify({ error: "oficina not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Bridge] Found oficina: ${oficina.id} (Slug: ${oficina.typebot_slug})`);

    // Get typebot_url from configuracoes_oficina
    const { data: config } = await supabase
      .from("configuracoes_oficina")
      .select("typebot_url")
      .eq("oficina_id", oficina.id)
      .maybeSingle();

    const typebotUrl = config?.typebot_url || "https://chat.lcrplay.com";
    console.log(`[Bridge] Using Typebot URL: ${typebotUrl}`);

    if (!oficina.typebot_slug || !oficina.evolution_api_url || !oficina.evolution_api_key) {
      console.error("[Bridge] Integration not fully configured in database");
      return new Response(JSON.stringify({ error: "integration not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = extractText(message);
    if (!text) {
      console.log("[Bridge] Ignoring message without extractable text");
      return new Response(JSON.stringify({ ignored: "no text" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[Bridge] User message text: "${text}"`);

    const replies = await typebotChat({
      typebotUrl,
      typebotSlug: oficina.typebot_slug,
      sessionId: sender,
      message: text,
    });

    for (const reply of replies) {
      await sendEvolutionMessage({
        url: oficina.evolution_api_url,
        apiKey: oficina.evolution_api_key,
        instance: oficina.evolution_instance_name!,
        number: sender,
        text: reply,
      });
    }

    console.log(`[Bridge] Finished processing. Sent ${replies.length} replies.`);
    return new Response(
      JSON.stringify({ success: true, sent: replies.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    console.error("[Bridge] Fatal error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});