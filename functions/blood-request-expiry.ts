import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export default async function (request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const expectedToken = Deno.env.get("BLOOD_REQUEST_EXPIRY_TOKEN");
  if (!expectedToken) {
    console.error("Blood request expiry token is not configured.");
    return new Response(JSON.stringify({ error: "Job is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (request.headers.get("Authorization") !== `Bearer ${expectedToken}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const baseUrl = Deno.env.get("SUPABASE_URL");
  const apiKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!baseUrl || !apiKey) {
    console.error("Blood request expiry database connection is not configured.");
    return new Response(JSON.stringify({ error: "Job is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(baseUrl, apiKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: deletedCount, error } = await admin.rpc(
    "delete_expired_blood_requests",
  );
  if (error) {
    console.error("Could not delete expired blood requests:", error.message);
    return new Response(JSON.stringify({ error: "Could not delete expired requests" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (typeof deletedCount !== "number" || !Number.isSafeInteger(deletedCount) || deletedCount < 0) {
    console.error("Blood request expiry RPC returned an invalid deletion count.");
    return new Response(JSON.stringify({ error: "Could not delete expired requests" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ deletedCount }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
