// ─────────────────────────────────────────────────────────────
// Faheem Ahmed — pay-per-video member library (real wiring)
// Vanilla port of the prototype. Supabase auth + data, Netlify Functions
// for checkout / playback. No build step.
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  var cfg = window.LIBRARY_CONFIG || {};
  var root = document.getElementById("root");

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("REPLACE_WITH") === 0) {
    root.removeAttribute("aria-busy");
    root.innerHTML =
      '<div class="fa-login-wrap"><div class="fa-login-card">' +
      '<div class="rx">Rx</div><h1>Not configured yet</h1>' +
      '<p class="sub">Add your Supabase URL and anon key in <b>library/config.js</b>, ' +
      "then reload.</p></div></div>";
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  // ── state ────────────────────────────────────────────────
  var state = {
    stage: "loading", // loading | login | code | app
    email: "",
    code: "",
    sending: false,
    verifying: false,
    authError: "",
    user: null,
    videos: [],
    owned: {}, // { videoId: true }
    filter: "all", // all | owned
    buying: null, // videoId being purchased
    loadingVideo: null, // videoId whose token is being fetched
    playing: null, // video object being watched
    playerUrl: null,
    toast: null,
    toastErr: false,
  };
  var toastTimer = null;

  function set(patch) {
    Object.assign(state, patch);
    render();
  }

  function showToast(msg, isErr) {
    state.toast = msg;
    state.toastErr = !!isErr;
    render();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      state.toast = null;
      render();
    }, 3200);
  }

  // ── helpers ──────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function priceLabel(pence) {
    var p = (pence || 0) / 100;
    return "£" + (Number.isInteger(p) ? p : p.toFixed(2));
  }
  function minutesOf(v) {
    if (!v.duration_seconds) return null;
    return Math.max(1, Math.round(v.duration_seconds / 60));
  }
  function gradient(v) {
    var g1 = v.thumb_g1 || "#2D5B73";
    var g2 = v.thumb_g2 || "#16313F";
    return "linear-gradient(135deg, " + g1 + ", " + g2 + ")";
  }
  function thumbStyle(v) {
    if (v.thumbnail_url) {
      return "background-image:url('" + esc(v.thumbnail_url) + "'), " + gradient(v) + ";";
    }
    return "background:" + gradient(v) + ";";
  }
  async function authHeader() {
    var res = await sb.auth.getSession();
    var token = res.data.session && res.data.session.access_token;
    return token ? { Authorization: "Bearer " + token } : {};
  }

  // ── data ─────────────────────────────────────────────────
  async function loadData() {
    var vids = await sb
      .from("videos")
      .select("id,title,blurb,price_pence,currency,duration_seconds,thumbnail_url,thumb_g1,thumb_g2,sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    var ownedRows = await sb.from("purchases").select("video_id");

    var ownedMap = {};
    if (ownedRows.data) ownedRows.data.forEach(function (r) { ownedMap[r.video_id] = true; });

    state.videos = vids.data || [];
    state.owned = ownedMap;
  }

  // Poll purchases until `videoId` shows up (webhook latency after Stripe).
  async function pollOwnership(videoId, tries) {
    tries = tries || 0;
    var res = await sb.from("purchases").select("video_id").eq("video_id", videoId).maybeSingle();
    if (res.data) {
      state.owned[videoId] = true;
      render();
      return true;
    }
    if (tries >= 6) return false;
    await new Promise(function (r) { setTimeout(r, 1500); });
    return pollOwnership(videoId, tries + 1);
  }

  // ── auth actions ─────────────────────────────────────────
  async function sendCode() {
    if (!state.email || state.sending) return;
    set({ sending: true, authError: "" });
    var res = await sb.auth.signInWithOtp({
      email: state.email.trim(),
      options: { shouldCreateUser: true },
    });
    if (res.error) {
      set({ sending: false, authError: res.error.message });
    } else {
      set({ sending: false, stage: "code", code: "" });
    }
  }

  async function verifyCode() {
    if (state.code.length < 6 || state.verifying) return;
    set({ verifying: true, authError: "" });
    var res = await sb.auth.verifyOtp({
      email: state.email.trim(),
      token: state.code,
      type: "email",
    });
    if (res.error) {
      set({ verifying: false, authError: res.error.message });
      return;
    }
    set({ verifying: false, user: res.data.user });
    await enterApp();
  }

  async function enterApp() {
    set({ stage: "app", videos: [], owned: {} });
    try {
      await loadData();
    } catch (e) {
      showToast("Could not load your library.", true);
    }
    render();
    handleReturnFromStripe();
  }

  async function logout() {
    await sb.auth.signOut();
    state.user = null;
    state.email = "";
    state.code = "";
    state.videos = [];
    state.owned = {};
    set({ stage: "login" });
  }

  // ── buy / watch ──────────────────────────────────────────
  async function buy(videoId) {
    if (state.buying) return;
    set({ buying: videoId });
    try {
      var headers = Object.assign({ "Content-Type": "application/json" }, await authHeader());
      var resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ videoId: videoId }),
      });
      var data = await resp.json();
      if (!resp.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url; // → Stripe-hosted checkout
    } catch (e) {
      set({ buying: null });
      showToast(e.message || "Could not start checkout.", true);
    }
  }

  async function watch(video) {
    if (state.loadingVideo) return;
    set({ loadingVideo: video.id });
    try {
      var headers = Object.assign({ "Content-Type": "application/json" }, await authHeader());
      var resp = await fetch("/api/get-video-token", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ videoId: video.id }),
      });
      var data = await resp.json();
      if (!resp.ok || !data.url) throw new Error(data.error || "Could not load video");
      set({ loadingVideo: null, playing: video, playerUrl: data.url });
    } catch (e) {
      set({ loadingVideo: null });
      showToast(e.message || "Could not load video.", true);
    }
  }

  // After returning from Stripe (?purchased=ID&session_id=...).
  function handleReturnFromStripe() {
    var params = new URLSearchParams(window.location.search);
    var purchased = params.get("purchased");
    var canceled = params.get("canceled");
    // Clean the URL either way.
    if (purchased || canceled) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (canceled) {
      showToast("Checkout canceled — no charge made.");
      return;
    }
    if (purchased) {
      var v = state.videos.find(function (x) { return x.id === purchased; });
      var title = v ? v.title : "your video";
      showToast("Payment received — unlocking " + (title.length > 34 ? title.slice(0, 34) + "…" : title) + "…");
      pollOwnership(purchased).then(function (ok) {
        if (ok) showToast("Added to your library.");
        else showToast("Payment received. It may take a moment to appear — refresh shortly.");
      });
    }
  }

  // ── render ───────────────────────────────────────────────
  var PLAY_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#15211C" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function playSvg(size, color) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + color + '" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  function render() {
    root.setAttribute("aria-busy", state.stage === "loading" ? "true" : "false");

    if (state.stage === "loading") {
      root.innerHTML = '<div class="fa-login-wrap"><span class="fa-spin dark"></span></div>';
      return;
    }

    if (state.stage === "login" || state.stage === "code") {
      root.innerHTML = renderLogin();
      bindLogin();
      return;
    }

    root.innerHTML = renderApp();
    bindApp();
  }

  function renderLogin() {
    if (state.stage === "login") {
      return (
        '<div class="fa-login-wrap"><div class="fa-login-card">' +
        '<div class="rx">Rx</div>' +
        '<div class="fa-eyebrow" style="margin-bottom:10px">Faheem Ahmed · Video library</div>' +
        "<h1>Sign in to your library</h1>" +
        '<p class="sub">Enter your email and we\'ll send you a one-time code. No password to remember.</p>' +
        '<div class="fa-field"><label for="email">Email address</label>' +
        '<input id="email" class="fa-input" type="email" placeholder="you@example.com" value="' + esc(state.email) + '" autocomplete="email"></div>' +
        '<button class="fa-btn-primary" id="sendBtn"' + (state.sending ? " disabled" : "") + ">" +
        (state.sending ? '<span class="fa-spin"></span> Sending…' : "Email me a code") +
        "</button>" +
        '<p class="fa-err">' + esc(state.authError) + "</p>" +
        "</div></div>"
      );
    }
    return (
      '<div class="fa-login-wrap"><div class="fa-login-card">' +
      '<div class="rx">Rx</div>' +
      '<div class="fa-eyebrow" style="margin-bottom:10px">Check your inbox</div>' +
      "<h1>Enter your code</h1>" +
      '<p class="sub">We sent a 6-digit code to <b style="color:var(--ink)">' + esc(state.email || "your email") + "</b>.</p>" +
      '<div class="fa-field"><label for="code">6-digit code</label>' +
      '<input id="code" class="fa-input code" inputmode="numeric" maxlength="6" placeholder="••••••" value="' + esc(state.code) + '" autocomplete="one-time-code"></div>' +
      '<button class="fa-btn-primary" id="verifyBtn"' + (state.verifying ? " disabled" : "") + ">" +
      (state.verifying ? '<span class="fa-spin"></span> Verifying…' : "Verify and sign in") +
      "</button>" +
      '<p class="fa-err">' + esc(state.authError) + "</p>" +
      '<button class="fa-link" id="diffEmail">Use a different email</button>' +
      "</div></div>"
    );
  }

  function bindLogin() {
    if (state.stage === "login") {
      var email = document.getElementById("email");
      email.addEventListener("input", function (e) { state.email = e.target.value; });
      email.addEventListener("keydown", function (e) { if (e.key === "Enter") sendCode(); });
      document.getElementById("sendBtn").addEventListener("click", sendCode);
      email.focus();
    } else {
      var code = document.getElementById("code");
      code.addEventListener("input", function (e) {
        state.code = e.target.value.replace(/\D/g, "").slice(0, 6);
        e.target.value = state.code;
      });
      code.addEventListener("keydown", function (e) { if (e.key === "Enter") verifyCode(); });
      document.getElementById("verifyBtn").addEventListener("click", verifyCode);
      document.getElementById("diffEmail").addEventListener("click", function () {
        set({ stage: "login", code: "", authError: "" });
      });
      code.focus();
    }
  }

  function renderApp() {
    var ownedCount = Object.keys(state.owned).length;
    var visible = state.filter === "owned"
      ? state.videos.filter(function (v) { return state.owned[v.id]; })
      : state.videos;

    var grid;
    if (state.videos.length === 0) {
      grid =
        '<div class="fa-empty"><h3>No videos yet</h3><p>Check back soon — published videos will appear here.</p></div>';
    } else if (visible.length === 0) {
      grid =
        '<div class="fa-empty"><h3>Nothing in your library yet</h3>' +
        "<p>Pick a video to get started — it'll appear here the moment you buy it.</p>" +
        '<button class="fa-buy" style="margin-top:18px" id="browseBtn">Browse videos</button></div>';
    } else {
      grid = '<div class="fa-grid">' + visible.map(renderCard).join("") + "</div>";
    }

    return (
      '<header class="fa-bar"><div class="mark">' +
      '<span class="fa-eyebrow">Video library</span>' +
      '<span class="name">Faheem Ahmed</span></div>' +
      '<div class="fa-userbox"><span class="who">' + esc(state.user && state.user.email ? state.user.email : "") + "</span>" +
      '<button class="fa-logout" id="logoutBtn">Log out</button></div></header>' +
      '<main class="fa-main"><div class="fa-lib-head"><div>' +
      "<h2>Your library</h2>" +
      '<div class="count">' + ownedCount + " " + (ownedCount === 1 ? "video" : "videos") +
      " owned · " + state.videos.length + " available</div></div>" +
      '<div class="fa-filter">' +
      '<button class="' + (state.filter === "all" ? "on" : "") + '" data-filter="all">All videos</button>' +
      '<button class="' + (state.filter === "owned" ? "on" : "") + '" data-filter="owned">Owned</button>' +
      "</div></div>" + grid + "</main>" +
      (state.playing ? renderPlayer() : "") +
      (state.toast ? renderToast() : "")
    );
  }

  function renderCard(v) {
    var isOwned = !!state.owned[v.id];
    var mins = minutesOf(v);
    var buying = state.buying === v.id;
    var loading = state.loadingVideo === v.id;
    return (
      '<article class="fa-card' + (isOwned ? " owned" : "") + '">' +
      '<div class="fa-thumb" style="' + thumbStyle(v) + (isOwned ? "cursor:pointer" : "") + '" ' +
      (isOwned ? 'data-watch="' + esc(v.id) + '"' : "") + ">" +
      (isOwned
        ? '<span class="fa-seal"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg>In your library</span>'
        : "") +
      '<span class="play">' + PLAY_SVG + "</span>" +
      (mins ? '<span class="fa-dur">' + mins + " min</span>" : "") +
      "</div>" +
      '<div class="fa-card-body"><h3>' + esc(v.title) + "</h3>" +
      '<p class="blurb">' + esc(v.blurb) + "</p>" +
      '<div class="fa-card-foot">' +
      (isOwned
        ? '<span class="fa-price" style="color:var(--brass)">Owned</span>' +
          '<button class="fa-watch" data-watch="' + esc(v.id) + '"' + (loading ? " disabled" : "") + ">" +
          (loading ? '<span class="fa-spin"></span> Loading…' : playSvg(14, "#fff") + " Watch") + "</button>"
        : '<span class="fa-price">' + priceLabel(v.price_pence) + "</span>" +
          '<button class="fa-buy" data-buy="' + esc(v.id) + '"' + (buying ? " disabled" : "") + ">" +
          (buying ? '<span class="fa-spin"></span> Starting…' : "Buy " + priceLabel(v.price_pence)) + "</button>") +
      "</div></div></article>"
    );
  }

  function renderPlayer() {
    var v = state.playing;
    return (
      '<div class="fa-overlay" id="playerOverlay"><div class="fa-player" role="dialog" aria-modal="true">' +
      '<button class="fa-back" id="playerBack"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>Back to library</button>' +
      '<div class="fa-player-frame">' +
      '<iframe src="' + esc(state.playerUrl) + '" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>' +
      "</div>" +
      '<p class="fa-player-note"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>' +
      "Streams securely from Bunny Stream with an expiring link — owned by you, not shareable.</p>" +
      '<div class="fa-player-meta"><h3>' + esc(v.title) + "</h3><p>" + esc(v.blurb) + "</p></div>" +
      "</div></div>"
    );
  }

  function renderToast() {
    return (
      '<div class="fa-toast' + (state.toastErr ? " err" : "") + '">' +
      (state.toastErr
        ? ""
        : '<svg class="ok" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg>') +
      esc(state.toast) + "</div>"
    );
  }

  function bindApp() {
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (b) {
      b.addEventListener("click", function () { set({ filter: b.getAttribute("data-filter") }); });
    });
    var browse = document.getElementById("browseBtn");
    if (browse) browse.addEventListener("click", function () { set({ filter: "all" }); });

    Array.prototype.forEach.call(document.querySelectorAll("[data-buy]"), function (b) {
      b.addEventListener("click", function () { buy(b.getAttribute("data-buy")); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-watch]"), function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-watch");
        var v = state.videos.find(function (x) { return x.id === id; });
        if (v) watch(v);
      });
    });

    var overlay = document.getElementById("playerOverlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) set({ playing: null, playerUrl: null });
      });
      document.getElementById("playerBack").addEventListener("click", function () {
        set({ playing: null, playerUrl: null });
      });
    }
  }

  // Escape closes the player.
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.playing) set({ playing: null, playerUrl: null });
  });

  // ── boot ─────────────────────────────────────────────────
  (async function boot() {
    render(); // shows loading spinner
    var res = await sb.auth.getSession();
    var session = res.data.session;
    if (session && session.user) {
      state.user = session.user;
      state.email = session.user.email || "";
      await enterApp();
    } else {
      set({ stage: "login" });
    }
  })();
})();
