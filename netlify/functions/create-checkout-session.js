// ─────────────────────────────────────────────────────────────
// create-checkout-session
// auth → server-side price lookup → Stripe Checkout → return url
//
// The client sends only { videoId }. The PRICE is read from the DB —
// never trusted from the client. (Security rule #3.)
// ─────────────────────────────────────────────────────────────
const Stripe = require("stripe");
const { serviceClient, getUser, json } = require("./_shared");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "http://localhost:8888";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  // 1. Validate the Supabase JWT.
  const user = await getUser(event);
  if (!user) return json(401, { error: "Not signed in" });

  // 2. Parse the request.
  let videoId;
  try {
    ({ videoId } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "Bad request body" });
  }
  if (!videoId) return json(400, { error: "Missing videoId" });

  const supa = serviceClient();

  // 3. Look the price up SERVER-SIDE from the DB. Only published videos.
  const { data: video, error: vErr } = await supa
    .from("videos")
    .select("id, title, blurb, price_pence, currency, published, coming_soon")
    .eq("id", videoId)
    .eq("published", true)
    .single();

  if (vErr || !video) return json(404, { error: "Video not found" });

  // Coming-soon videos can't be bought — even if a client forges the request.
  if (video.coming_soon) return json(400, { error: "Not available yet" });

  // 4. Already owned? Don't let them pay twice.
  const { data: existing } = await supa
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();
  if (existing) return json(409, { error: "Already owned" });

  // 5. Create the one-time Checkout Session with an inline price.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: video.currency || "gbp",
            unit_amount: video.price_pence, // from the DB, in pence
            product_data: {
              name: video.title,
              description: video.blurb || undefined,
            },
          },
        },
      ],
      // metadata is the bridge to the webhook — this is what grants access.
      metadata: { user_id: user.id, video_id: video.id },
      success_url: `${SITE_URL}/library/?purchased=${encodeURIComponent(video.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/library/?canceled=${encodeURIComponent(video.id)}`,
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return json(500, { error: "Could not start checkout" });
  }
};
