// ─────────────────────────────────────────────────────────────
// Shared helpers for the Netlify Functions.
// CORS, JSON responses, and Supabase JWT validation.
// ─────────────────────────────────────────────────────────────
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client: bypasses RLS. Server-side ONLY — never exposed.
function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// CORS: the library page and the functions are served from the same
// origin in production, so '*' is harmless here (no cookies are used —
// auth travels as a Bearer token). Tighten to SITE_URL if you prefer.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

// Validate the Supabase access token from the Authorization header.
// Returns the user object, or null if missing/invalid.
async function getUser(event) {
  const auth =
    event.headers.authorization || event.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const supa = serviceClient();
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data || !data.user) return null;
  return data.user;
}

module.exports = { serviceClient, getUser, json, CORS };
