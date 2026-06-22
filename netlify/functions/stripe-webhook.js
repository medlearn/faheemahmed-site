// ─────────────────────────────────────────────────────────────
// stripe-webhook
// verify signature (RAW body) → insert purchase (service role, idempotent)
//
// This is the ONLY place an entitlement is created. Access is never
// granted from the success_url redirect (it can be forged). (Rule #1.)
// ─────────────────────────────────────────────────────────────
const Stripe = require("stripe");
const { serviceClient } = require("./_shared");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const sig = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];
  if (!sig) return { statusCode: 400, body: "Missing signature" };

  // RAW body — must NOT be JSON.parsed before verifying. (Rule #2.)
  // Netlify may base64-encode the body; decode to the exact bytes Stripe sent.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    // Acknowledge anything else so Stripe stops retrying.
    return { statusCode: 200, body: "ignored" };
  }

  const session = stripeEvent.data.object;
  const userId = session.metadata && session.metadata.user_id;
  const videoId = session.metadata && session.metadata.video_id;

  if (!userId || !videoId) {
    console.error("Webhook missing metadata", { id: session.id });
    return { statusCode: 400, body: "Missing metadata" };
  }
  // Only grant on a paid session.
  if (session.payment_status && session.payment_status !== "paid") {
    return { statusCode: 200, body: "not paid" };
  }

  const supa = serviceClient();

  // Idempotent insert: Stripe may deliver the same event twice. The
  // (user_id, video_id) unique constraint means a duplicate is a no-op.
  const { error } = await supa
    .from("purchases")
    .upsert(
      {
        user_id: userId,
        video_id: videoId,
        stripe_session_id: session.id,
        amount_pence: session.amount_total,
        currency: session.currency,
      },
      { onConflict: "user_id,video_id", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Failed to record purchase:", error.message);
    // 500 → Stripe will retry, which is what we want on a transient error.
    return { statusCode: 500, body: "DB error" };
  }

  // Notify Faheem by email (best-effort — never fails the webhook).
  try {
    await notifyPurchase(supa, session, videoId);
  } catch (e) {
    console.error("Purchase notification failed:", e.message);
  }

  return { statusCode: 200, body: "ok" };
};

// Email Faheem on each sale via Resend's API. No-op if RESEND_API_KEY unset.
async function notifyPurchase(supa, session, videoId) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || "hello@faheemahmed.co.uk";
  if (!key) return;

  const { data: v } = await supa.from("videos").select("title").eq("id", videoId).single();
  const title = (v && v.title) || videoId;
  const amount = ((session.amount_total || 0) / 100).toFixed(2);
  const cur = (session.currency || "gbp").toUpperCase();
  const buyer =
    (session.customer_details && session.customer_details.email) ||
    session.customer_email ||
    "unknown";
  const esc = (s) =>
    String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Faheem Ahmed Library <noreply@faheemahmed.co.uk>",
      to: [to],
      subject: `New purchase — ${title} (£${amount})`,
      html:
        "<h2>New library purchase 🎉</h2>" +
        "<p><b>Video:</b> " + esc(title) + "<br>" +
        "<b>Amount:</b> £" + amount + " " + cur + "<br>" +
        "<b>Customer:</b> " + esc(buyer) + "</p>",
    }),
  });
}
