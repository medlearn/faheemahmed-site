// ─────────────────────────────────────────────────────────────
// get-video-token
// auth → ownership check → short-lived, token-authenticated Bunny URL
//
// An un-owned user can never obtain a playable URL. The Bunny token key
// is server-side only; the signed URL expires (default 4h). (Rules #4/#6.)
//
// Implements Bunny Stream "Embed View Token Authentication":
//   token   = sha256_hex( tokenAuthKey + videoId + expires )
//   url     = https://iframe.mediadelivery.net/embed/{lib}/{videoId}
//             ?token={token}&expires={expires}
// (Enable "Token Authentication" on the library's Embed settings in Bunny.)
// ─────────────────────────────────────────────────────────────
const crypto = require("crypto");
const { serviceClient, getUser, json } = require("./_shared");

const TOKEN_KEY = process.env.BUNNY_TOKEN_AUTH_KEY;
const DEFAULT_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
const CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME; // optional, for HLS url
const EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  // 1. Validate the Supabase JWT.
  const user = await getUser(event);
  if (!user) return json(401, { error: "Not signed in" });

  let videoId;
  try {
    ({ videoId } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "Bad request body" });
  }
  if (!videoId) return json(400, { error: "Missing videoId" });

  const supa = serviceClient();

  // 2. Ownership check — a row in purchases is the only thing that counts.
  const { data: owned } = await supa
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (!owned) return json(403, { error: "Not owned" });

  // 3. Fetch the Bunny identifiers for this video.
  const { data: video, error: vErr } = await supa
    .from("videos")
    .select("bunny_video_id, bunny_library_id")
    .eq("id", videoId)
    .single();

  if (vErr || !video) return json(404, { error: "Video not found" });

  const libraryId = video.bunny_library_id || DEFAULT_LIBRARY_ID;
  const bunnyId = video.bunny_video_id;

  if (!TOKEN_KEY || !libraryId || !bunnyId) {
    console.error("Bunny config missing", {
      hasKey: !!TOKEN_KEY,
      libraryId,
      bunnyId,
    });
    return json(500, { error: "Video not configured" });
  }

  // 4. Build the expiring, token-authenticated embed URL.
  const expires = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS;
  const token = crypto
    .createHash("sha256")
    .update(TOKEN_KEY + bunnyId + expires)
    .digest("hex");

  const embedUrl =
    `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyId}` +
    `?token=${token}&expires=${expires}&autoplay=true&preload=true`;

  // Optional: a directly-playable HLS URL via the CDN pull zone, using
  // path-based CDN token authentication. Handy if you swap the iframe for
  // a custom HLS player. Returned as `hlsUrl` for convenience.
  let hlsUrl;
  if (CDN_HOSTNAME) {
    const path = `/${bunnyId}/playlist.m3u8`;
    const raw = crypto
      .createHash("sha256")
      .update(TOKEN_KEY + path + expires)
      .digest("base64");
    const cdnToken = raw.replace(/\n/g, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    hlsUrl = `https://${CDN_HOSTNAME}${path}?token=${cdnToken}&expires=${expires}`;
  }

  return json(
    200,
    { url: embedUrl, hlsUrl, expires },
    { "Cache-Control": "no-store" }
  );
};
