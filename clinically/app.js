/* ============================================================
   ClinicAlly — application logic (front-end demo)
   Hash-routed single-page app. All "AI" output is pre-authored in
   data.js and rendered with a simulated processing delay; nothing
   is sent anywhere. State persists to localStorage within the demo.
   ============================================================ */

(function () {
  "use strict";
  const D = window.CA_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const ic = (id, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24"><use href="#${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- persistent demo state ---------- */
  const STORE = "clinically_demo_v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} };
  const persisted = load();
  const state = {
    savedNotes: persisted.savedNotes || [],   // notes created during the demo session
    cases: persisted.cases || [],             // MDT cases submitted during the demo
    training: persisted.training || {}        // module id -> progress override
  };

  /* ---------- navigation model ---------- */
  const NAV = {
    top: [
      { id: "dashboard", label: "Dashboard", icon: "i-grid", title: "Dashboard", sub: "Your clinical day at a glance" },
      { id: "consult", label: "Consultation", icon: "i-stetho", title: "Consultation co-pilot", sub: "Ambient transcription, drafted notes and guideline-backed support" },
      { id: "notes", label: "Clinical notes", icon: "i-note", title: "Clinical notes", sub: "Everything the co-pilot has drafted with you" },
      { id: "guidelines", label: "Guidelines", icon: "i-book", title: "Guidelines", sub: "NICE, GMC, GPhC and more — kept current" },
      { id: "templates", label: "Templates & SOPs", icon: "i-doc", title: "Templates & SOPs", sub: "Documentation that stands up to inspection" },
      { id: "training", label: "Training", icon: "i-cap", title: "Training", sub: "Upskill yourself and your clinic team" }
    ],
    mdt: [
      { id: "mdt", label: "MDT overview", icon: "i-people", title: "Multidisciplinary team", sub: "The colleague down the corridor you never had" },
      { id: "cases", label: "My cases", icon: "i-inbox", title: "My MDT cases", sub: "Submit and track anonymised cases", badge: () => openCaseCount() },
      { id: "library", label: "Session library", icon: "i-play", title: "Session library", sub: "Recorded MDT learning, searchable" }
    ]
  };

  function allCases() { return state.cases.concat(D.cases); }
  function openCaseCount() { return allCases().filter(c => c.status !== "Answered").length; }

  /* ============================================================
     Boot
     ============================================================ */
  function init() {
    $("#userAv").textContent = D.clinician.initials;
    $("#userName").textContent = D.clinician.name;
    $("#userRole").textContent = D.clinician.role;
    buildSidebar();
    window.addEventListener("hashchange", route);
    $("#hamb").addEventListener("click", () => $("#app").classList.toggle("nav-open"));
    $("#scrim").addEventListener("click", () => $("#app").classList.remove("nav-open"));
    route();
  }

  function buildSidebar() {
    const mk = (item) => {
      const b = el(`<button class="nav-i" data-go="${item.id}">${ic(item.icon)}<span>${item.label}</span></button>`);
      const badge = item.badge && item.badge();
      if (badge) b.insertAdjacentHTML("beforeend", `<span class="badge">${badge}</span>`);
      b.addEventListener("click", () => go(item.id));
      return b;
    };
    const top = $("#navTop"), mdt = $("#navMdt");
    top.innerHTML = ""; mdt.innerHTML = "";
    NAV.top.forEach(i => top.appendChild(mk(i)));
    NAV.mdt.forEach(i => mdt.appendChild(mk(i)));
  }

  function go(id) { location.hash = "#" + id; }

  function route() {
    const id = (location.hash.replace("#", "") || "dashboard");
    const item = [...NAV.top, ...NAV.mdt].find(i => i.id === id) || NAV.top[0];
    $("#pageTitle").textContent = item.title;
    $("#pageSub").textContent = item.sub;
    document.querySelectorAll(".nav-i").forEach(b => b.classList.toggle("active", b.dataset.go === item.id));
    $("#app").classList.remove("nav-open");
    const view = $("#view");
    view.innerHTML = "";
    (VIEWS[item.id] || VIEWS.dashboard)(view);
    view.scrollIntoView({ block: "start" });
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Toasts
     ============================================================ */
  function toast(msg) {
    const t = el(`<div class="toast"><span class="ti">${ic("i-check")}</span><span>${msg}</span></div>`);
    $("#toasts").appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .4s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ============================================================
     Modal
     ============================================================ */
  function modal(title, bodyHtml, onMount) {
    const root = $("#modalRoot");
    const bg = el(`<div class="modal-bg"><div class="modal"><div class="mh"><h3>${title}</h3><button class="x" aria-label="Close">${ic("i-x")}</button></div><div class="mb"></div></div></div>`);
    $(".mb", bg).innerHTML = bodyHtml;
    const close = () => bg.remove();
    $(".x", bg).addEventListener("click", close);
    bg.addEventListener("click", e => { if (e.target === bg) close(); });
    root.appendChild(bg);
    if (onMount) onMount(bg, close);
    return { close, root: bg };
  }

  /* ============================================================
     VIEW: Dashboard
     ============================================================ */
  const VIEWS = {};

  VIEWS.dashboard = (v) => {
    const m = D.metrics;
    const fiIcon = { note: "i-note", mdt: "i-people", guide: "i-book", train: "i-cap" };
    const ns = D.nextSession;
    v.innerHTML = `
      <div class="banner">
        <span class="bi">${ic("i-people")}</span>
        <div>
          <b>${esc(ns.title)} is coming up</b>
          <p>${ns.agenda[0]} · ${ns.agenda.length} agenda items</p>
        </div>
        <div class="when"><b>${fmtDate(ns.date)}</b>${esc(ns.time)}</div>
      </div>

      <div class="metrics">
        ${m.map(x => `<div class="metric"><div class="v">${x.value}</div><div class="l">${esc(x.label)}</div><div class="d">${esc(x.delta)}</div></div>`).join("")}
      </div>

      <div class="dash-grid">
        <div>
          <div class="sec-title"><h2 class="h">Quick actions</h2></div>
          <div class="quick">
            <button class="qa ai-a" data-act="consult"><span class="ic">${ic("i-mic")}</span><span><b>Start a consultation</b><small>Transcribe & draft a note with the co-pilot</small></span></button>
            <button class="qa" data-act="case"><span class="ic">${ic("i-send")}</span><span><b>Ask the MDT</b><small>Submit an anonymised case to the panel</small></span></button>
            <button class="qa" data-act="guidelines"><span class="ic">${ic("i-book")}</span><span><b>Check guidance</b><small>Search NICE, GMC & GPhC</small></span></button>
            <button class="qa" data-act="templates"><span class="ic">${ic("i-doc")}</span><span><b>Open a template</b><small>SOPs & note templates</small></span></button>
          </div>

          <div class="sec-title" style="margin-top:26px"><h2 class="h">Recent notes</h2><button class="btn ghost sm" data-act="notes">View all</button></div>
          <div class="list">
            ${recentNotes().slice(0, 3).map(noteRow).join("")}
          </div>
        </div>

        <div>
          <div class="sec-title"><h2 class="h">Activity</h2></div>
          <div class="card pad">
            <ul class="feed">
              ${D.activity.map(a => `<li><span class="fi">${ic(fiIcon[a.icon] || "i-info")}</span><div><div class="ft">${a.text}</div><time>${esc(a.time)}</time></div></li>`).join("")}
            </ul>
          </div>
        </div>
      </div>`;
    v.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const a = b.dataset.act;
      if (a === "case") go("cases");
      else go(a);
    }));
    bindNoteRows(v);
  };

  /* ============================================================
     VIEW: Consultation co-pilot  (the centrepiece)
     ============================================================ */
  let consultTimer = null;

  VIEWS.consult = (v) => {
    let current = D.scenarios[0];
    const sessionStore = { transcript: [], generated: null, playing: false };

    v.innerHTML = `
      <div class="ptbar">
        <div class="f"><small>Scenario</small>
          <select class="select" id="scen" style="margin-top:2px">
            ${D.scenarios.map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join("")}
          </select>
        </div>
        <div class="f"><small>Patient (anonymised)</small><b id="pref"></b></div>
        <div class="f"><small>Age / Sex</small><b id="page"></b></div>
        <div class="f" style="flex:1;min-width:160px"><small>Reason for encounter</small><b id="prsn"></b></div>
        <div class="sp"></div>
        <div id="recState"></div>
      </div>

      <div class="consult">
        <!-- Transcription -->
        <section class="panel">
          <div class="ph"><span class="ic">${ic("i-mic")}</span><span class="ti">Live transcription</span></div>
          <div class="pb">
            <div id="transWrap"></div>
            <div style="display:flex;gap:10px;margin-top:14px">
              <button class="btn" id="recBtn">${ic("i-play")} Start consultation</button>
              <button class="btn ghost" id="clearBtn">Clear</button>
            </div>
          </div>
        </section>

        <!-- Generated note -->
        <section class="panel">
          <div class="ph"><span class="ic ai">${ic("i-spark")}</span><span class="ti">AI-drafted clinical note</span><span class="tag ai" style="margin-left:auto">Co-pilot</span></div>
          <div class="pb">
            <div id="noteWrap"></div>
            <div id="noteActions" style="display:none;gap:10px;margin-top:16px;flex-wrap:wrap">
              <button class="btn dark" id="signBtn">${ic("i-check")} Sign & save note</button>
              <button class="btn ghost" id="copyBtn">Copy</button>
              <button class="btn ghost" id="askMdtBtn">${ic("i-send")} Send to MDT</button>
            </div>
          </div>
        </section>

        <!-- Decision support -->
        <section class="panel">
          <div class="ph"><span class="ic">${ic("i-shield")}</span><span class="ti">Decision support</span></div>
          <div class="pb"><div id="dsWrap"></div></div>
        </section>
      </div>`;

    const transWrap = $("#transWrap", v), noteWrap = $("#noteWrap", v), dsWrap = $("#dsWrap", v);
    const recBtn = $("#recBtn", v), recState = $("#recState", v), noteActions = $("#noteActions", v);

    function setScenario(s) {
      current = s;
      stopPlaying();
      sessionStore.transcript = []; sessionStore.generated = null;
      $("#pref", v).textContent = s.patient.ref;
      $("#page", v).textContent = `${s.patient.age} / ${s.patient.sex}`;
      $("#prsn", v).textContent = s.patient.reason;
      renderTranscript(); renderNoteEmpty(); renderDsEmpty();
      recState.innerHTML = "";
      recBtn.innerHTML = `${ic("i-play")} Start consultation`;
    }

    function renderTranscript() {
      if (!sessionStore.transcript.length) {
        transWrap.innerHTML = `<div class="rec-empty"><span class="mic">${ic("i-mic")}</span><div><b>Ready to listen</b><div class="muted" style="font-size:.84rem;margin-top:4px">Press start to simulate an ambient consultation. ClinicAlly transcribes in the background.</div></div></div>`;
        return;
      }
      transWrap.innerHTML = `<div class="transcript" id="tscroll">${sessionStore.transcript.map(l =>
        `<div class="tline ${l.who.toLowerCase()}"><span class="w">${esc(l.who)}</span><span class="b">${esc(l.t)}</span></div>`).join("")}</div>`;
      const sc = $("#tscroll", v); if (sc) sc.scrollTop = sc.scrollHeight;
    }

    function renderNoteEmpty() {
      noteActions.style.display = "none";
      noteWrap.innerHTML = `<div class="note-empty"><span class="ic">${ic("i-spark")}</span><div><b>No note yet</b><div style="font-size:.84rem;margin-top:4px;max-width:230px">Once the consultation is captured, ClinicAlly drafts a structured SOAP note for you to review and sign.</div></div></div>`;
    }
    function renderDsEmpty() {
      dsWrap.innerHTML = `<div class="ds-empty">Guideline-backed checks appear here as the consultation progresses.</div>`;
    }

    function renderNote(n) {
      const part = (k, label, text) => `<div class="soap"><h4 data-k="${k}">${label}</h4><p>${esc(text)}</p></div>`;
      noteWrap.innerHTML = `<div class="note-out">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <span class="tag teal">${esc(n.type)}</span>
          <span class="tag ai">${ic("i-spark")} Drafted in 2.1s</span>
        </div>
        ${part("S", "Subjective", n.S)}
        ${part("O", "Objective", n.O)}
        ${part("A", "Assessment", n.A)}
        ${part("P", "Plan", n.P)}
        <div class="divider"></div>
        <div class="lbl mono" style="font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Suggested coding</div>
        <div class="note-codes">${n.codes.map(c => `<span class="tag">${esc(c)}</span>`).join("")}</div>
        <div class="disc">${ic("i-info")} ClinicAlly drafts and supports — it does not diagnose or prescribe. Review, edit and sign. The decision and accountability remain yours.</div>
      </div>`;
      noteActions.style.display = "flex";
    }

    function renderDs(items) {
      dsWrap.innerHTML = `<div class="ds">${items.map(d => {
        const lvl = { guide: "teal", monitor: "info", flag: "warn", scope: "ai" }[d.level] || "teal";
        const iconId = { guide: "i-book", monitor: "i-pulse", flag: "i-info", scope: "i-shield" }[d.level] || "i-book";
        return `<div class="ds-item ${d.level}"><div class="dh"><span class="tag ${lvl}">${ic(iconId)}</span><b>${esc(d.title)}</b></div><p>${esc(d.body)}</p><span class="ref">${esc(d.ref)}</span></div>`;
      }).join("")}</div>`;
    }

    /* ---- simulated ambient transcription ---- */
    function stopPlaying() {
      sessionStore.playing = false;
      if (consultTimer) { clearTimeout(consultTimer); consultTimer = null; }
    }

    function playConsultation() {
      stopPlaying();
      sessionStore.transcript = []; sessionStore.generated = null;
      renderTranscript(); renderNoteEmpty(); renderDsEmpty();
      sessionStore.playing = true;
      recBtn.innerHTML = `Listening…`; recBtn.disabled = true;
      recState.innerHTML = `<span class="recdot"><i></i> Recording</span>`;
      let i = 0;
      const lines = current.transcript;
      const step = () => {
        if (!sessionStore.playing) return;
        if (i >= lines.length) { finishConsultation(); return; }
        sessionStore.transcript.push(lines[i]); i++;
        renderTranscript();
        consultTimer = setTimeout(step, 850 + Math.min(lines[i - 1].t.length * 9, 1100));
      };
      consultTimer = setTimeout(step, 500);
    }

    function finishConsultation() {
      sessionStore.playing = false;
      recState.innerHTML = `<span class="tag ok">${ic("i-check")} Captured</span>`;
      recBtn.disabled = false; recBtn.innerHTML = `${ic("i-play")} Replay`;
      generateNote();
    }

    function generateNote() {
      const steps = ["Structuring the consultation…", "Mapping to SOAP format…", "Cross-checking guidelines…", "Drafting suggested coding…"];
      let si = 0;
      noteWrap.innerHTML = `<div class="gen-loader"><div class="spinner"></div><div class="step" id="genStep">${steps[0]}</div></div>`;
      const adv = () => {
        si++;
        if (si < steps.length) { const e = $("#genStep", v); if (e) e.textContent = steps[si]; consultTimer = setTimeout(adv, 620); }
        else {
          sessionStore.generated = current.note;
          renderNote(current.note);
          renderDs(current.support);
          toast("Co-pilot drafted a SOAP note — ready for your review.");
        }
      };
      consultTimer = setTimeout(adv, 620);
    }

    /* ---- actions ---- */
    $("#scen", v).addEventListener("change", e => setScenario(D.scenarios.find(s => s.id === e.target.value)));
    recBtn.addEventListener("click", playConsultation);
    $("#clearBtn", v).addEventListener("click", () => setScenario(current));

    v.addEventListener("click", e => {
      if (e.target.closest("#signBtn")) {
        const n = current.note;
        const id = "N-" + (1043 + state.savedNotes.length);
        state.savedNotes.unshift({ id, date: today(), patient: current.patient.ref, type: n.type.replace("SOAP — ", ""), title: current.label, status: "Signed", excerpt: n.S.slice(0, 90) + "…", full: n });
        save(); buildSidebar();
        toast(`Note ${id} signed and saved.`);
      }
      if (e.target.closest("#copyBtn")) {
        const n = current.note;
        const text = `${n.type}\n\nSUBJECTIVE\n${n.S}\n\nOBJECTIVE\n${n.O}\n\nASSESSMENT\n${n.A}\n\nPLAN\n${n.P}`;
        navigator.clipboard?.writeText(text).then(() => toast("Note copied to clipboard."), () => toast("Note copied."));
      }
      if (e.target.closest("#askMdtBtn")) {
        openCaseModal({ title: current.label, specialty: current.specialty, summary: current.note.A });
      }
    });

    setScenario(current);
  };

  /* ============================================================
     VIEW: Clinical notes
     ============================================================ */
  function recentNotes() { return state.savedNotes.concat(D.notes); }

  function noteRow(n) {
    const cls = n.status === "Signed" ? "ok" : "warn";
    return `<button class="litem" data-note="${n.id}">
      <span class="ic">${ic("i-note")}</span>
      <span class="bd"><b>${esc(n.title)}</b><small>${esc(n.excerpt)}</small></span>
      <span class="meta">${esc(n.id)}<br><span class="tag ${cls}" style="margin-top:4px">${esc(n.status)}</span></span>
    </button>`;
  }
  function bindNoteRows(scope) {
    scope.querySelectorAll("[data-note]").forEach(b => b.addEventListener("click", () => {
      const n = recentNotes().find(x => x.id === b.dataset.note);
      if (n) showNote(n);
    }));
  }
  function showNote(n) {
    const full = n.full;
    const body = full ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span class="tag teal">${esc(full.type)}</span><span class="tag ${n.status === "Signed" ? "ok" : "warn"}">${esc(n.status)}</span><span class="tag">${esc(n.patient)}</span></div>
      ${["S", "O", "A", "P"].map(k => `<div class="soap"><h4 data-k="${k}">${({ S: "Subjective", O: "Objective", A: "Assessment", P: "Plan" })[k]}</h4><p>${esc(full[k])}</p></div>`).join("")}`
      : `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span class="tag">${esc(n.type)}</span><span class="tag ${n.status === "Signed" ? "ok" : "warn"}">${esc(n.status)}</span><span class="tag">${esc(n.patient)}</span><span class="tag">${esc(n.date)}</span></div>
        <p class="muted" style="font-size:.9rem;line-height:1.6">${esc(n.excerpt)}</p>
        <div class="disc" style="margin-top:16px">${ic("i-info")} Full record preview is available for notes drafted in this demo session. Saved historical notes show a summary.</div>`;
    modal(esc(n.title), body);
  }

  VIEWS.notes = (v) => {
    const notes = recentNotes();
    v.innerHTML = `
      <div class="search"><svg viewBox="0 0 24 24">${useGlyph("i-search")}</svg><input id="nq" placeholder="Search notes by title, patient or type…"></div>
      <div class="list" id="nlist">${notes.map(noteRow).join("")}</div>`;
    bindNoteRows(v);
    $("#nq", v).addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const f = notes.filter(n => (n.title + n.type + n.patient + n.excerpt).toLowerCase().includes(q));
      $("#nlist", v).innerHTML = f.length ? f.map(noteRow).join("") : `<div class="empty">No notes match “${esc(e.target.value)}”.</div>`;
      bindNoteRows(v);
    });
  };

  /* ============================================================
     VIEW: Guidelines
     ============================================================ */
  VIEWS.guidelines = (v) => {
    const srcColor = { NICE: "teal", GMC: "info", GPhC: "ai", BNF: "ok", MHRA: "alert" };
    let activeSrc = "All";
    const sources = ["All", ...new Set(D.guidelines.map(g => g.source))];
    const card = (g) => `<div class="tile">
        <div class="th"><span class="ic">${ic("i-book")}</span><div><span class="tag ${srcColor[g.source] || "teal"}">${esc(g.source)} · ${esc(g.id)}</span></div></div>
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.summary)}</p>
        <div class="tf"><span class="mono" style="font-size:.72rem;color:var(--muted)">Updated ${esc(g.updated)}</span><button class="btn ghost sm" data-g="${g.id}">Open</button></div>
      </div>`;
    v.innerHTML = `
      <div class="search"><svg viewBox="0 0 24 24">${useGlyph("i-search")}</svg><input id="gq" placeholder="Search guidance — e.g. ‘ADHD titration’, ‘UTI’, ‘consent’…"></div>
      <div class="chips" id="gchips">${sources.map(s => `<button class="chip ${s === "All" ? "on" : ""}" data-src="${s}">${esc(s)}</button>`).join("")}</div>
      <div class="cards" id="gcards"></div>`;

    function render() {
      const q = $("#gq", v).value.toLowerCase();
      const f = D.guidelines.filter(g =>
        (activeSrc === "All" || g.source === activeSrc) &&
        (g.title + g.summary + g.tags.join(" ") + g.id).toLowerCase().includes(q));
      $("#gcards", v).innerHTML = f.length ? f.map(card).join("") : `<div class="empty">No guidance matches your search.</div>`;
      v.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => {
        const g = D.guidelines.find(x => x.id === b.dataset.g);
        modal(`${g.source} · ${g.id}`, `<h2 class="h" style="margin-bottom:10px">${esc(g.title)}</h2>
          <div style="display:flex;gap:8px;margin-bottom:14px"><span class="tag ${srcColor[g.source] || "teal"}">${esc(g.source)}</span><span class="tag">Updated ${esc(g.updated)}</span></div>
          <p style="font-size:.92rem;line-height:1.65;color:var(--ink-2)">${esc(g.summary)}</p>
          <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px">${g.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          <div class="disc" style="margin-top:18px">${ic("i-info")} Demo content. In the live product this links to the current full guideline text, version-tracked so you can evidence what guidance said at the time of your decision.</div>`);
      }));
    }
    $("#gq", v).addEventListener("input", render);
    v.querySelectorAll("#gchips .chip").forEach(c => c.addEventListener("click", () => {
      activeSrc = c.dataset.src;
      v.querySelectorAll("#gchips .chip").forEach(x => x.classList.toggle("on", x === c));
      render();
    }));
    render();
  };

  /* ============================================================
     VIEW: Templates & SOPs
     ============================================================ */
  VIEWS.templates = (v) => {
    const kindColor = { "Note template": "teal", "SOP": "info", "Governance": "ai", "Patient-facing": "ok" };
    const kindIcon = { "Note template": "i-note", "SOP": "i-doc", "Governance": "i-shield", "Patient-facing": "i-people" };
    let activeKind = "All";
    const kinds = ["All", ...new Set(D.templates.map(t => t.kind))];
    const card = (t) => `<div class="tile">
        <div class="th"><span class="ic">${ic(kindIcon[t.kind] || "i-doc")}</span><div><span class="tag ${kindColor[t.kind] || "teal"}">${esc(t.kind)}</span></div></div>
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.desc)}</p>
        <div class="tf"><span class="mono" style="font-size:.72rem;color:var(--muted)">Updated ${esc(t.updated)}</span>
          <div style="display:flex;gap:6px"><button class="btn ghost sm" data-use="${t.id}">Use</button></div>
        </div>
      </div>`;
    v.innerHTML = `
      <div class="chips" id="tchips">${kinds.map(k => `<button class="chip ${k === "All" ? "on" : ""}" data-k="${k}">${esc(k)}</button>`).join("")}</div>
      <div class="cards" id="tcards"></div>`;
    function render() {
      const f = D.templates.filter(t => activeKind === "All" || t.kind === activeKind);
      $("#tcards", v).innerHTML = f.map(card).join("");
      v.querySelectorAll("[data-use]").forEach(b => b.addEventListener("click", () => {
        const t = D.templates.find(x => x.id === b.dataset.use);
        toast(`“${t.name}” loaded into your workspace.`);
      }));
    }
    v.querySelectorAll("#tchips .chip").forEach(c => c.addEventListener("click", () => {
      activeKind = c.dataset.k;
      v.querySelectorAll("#tchips .chip").forEach(x => x.classList.toggle("on", x === c));
      render();
    }));
    render();
  };

  /* ============================================================
     VIEW: Training
     ============================================================ */
  VIEWS.training = (v) => {
    const lvlColor = { Core: "teal", Specialty: "ai", Safety: "alert", Professional: "info" };
    const prog = (t) => state.training[t.id] != null ? state.training[t.id] : t.progress;
    const card = (t) => {
      const p = prog(t);
      const label = p >= 100 ? "Completed" : p > 0 ? "Continue" : "Start";
      return `<div class="tile">
        <div class="th"><span class="ic">${ic("i-cap")}</span><span class="tag ${lvlColor[t.level] || "teal"}">${esc(t.level)}</span><span class="mono" style="margin-left:auto;font-size:.72rem;color:var(--muted)">${t.mins} min</span></div>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.desc)}</p>
        <div class="progress"><i style="width:${p}%"></i></div>
        <div class="tf"><span class="mono" style="font-size:.72rem;color:var(--muted)">${p}% complete</span>
          <button class="btn ${p >= 100 ? "ghost" : ""} sm" data-tr="${t.id}">${label}</button></div>
      </div>`;
    };
    const done = D.training.filter(t => prog(t) >= 100).length;
    v.innerHTML = `
      <div class="metrics" style="grid-template-columns:repeat(3,1fr);margin-bottom:8px">
        <div class="metric"><div class="v">${done}/${D.training.length}</div><div class="l">Modules completed</div></div>
        <div class="metric"><div class="v">${D.training.reduce((a, t) => a + t.mins, 0)}</div><div class="l">Minutes of content</div></div>
        <div class="metric"><div class="v">CPD</div><div class="l">Auto-logged for revalidation</div></div>
      </div>
      <div class="cards" id="trcards" style="margin-top:18px"></div>`;
    function render() {
      $("#trcards", v).innerHTML = D.training.map(card).join("");
      v.querySelectorAll("[data-tr]").forEach(b => b.addEventListener("click", () => {
        const t = D.training.find(x => x.id === b.dataset.tr);
        const p = prog(t);
        state.training[t.id] = p >= 100 ? 100 : Math.min(100, (p || 0) + (p === 0 ? 35 : 40));
        save();
        toast(state.training[t.id] >= 100 ? `“${t.title}” completed — CPD logged.` : `Progress saved on “${t.title}”.`);
        render();
      }));
    }
    render();
  };

  /* ============================================================
     VIEW: MDT overview
     ============================================================ */
  VIEWS.mdt = (v) => {
    const ns = D.nextSession;
    v.innerHTML = `
      <div class="banner">
        <span class="bi">${ic("i-cal")}</span>
        <div><b>${esc(ns.title)}</b><p>${esc(ns.format)} · ${esc(ns.time)}</p></div>
        <div class="when"><b>${fmtDate(ns.date)}</b>Live session</div>
      </div>

      <div class="mdt-grid">
        <div>
          <div class="sec-title"><h2 class="h">How the MDT works for you</h2></div>
          <div class="cards" style="grid-template-columns:1fr 1fr">
            <div class="tile"><div class="th"><span class="ic">${ic("i-cal")}</span></div><h3>Regular live sessions</h3><p>A recurring virtual MDT — part teaching, part case discussion, part open reflection. Bring anonymised cases and questions.</p></div>
            <div class="tile"><div class="th"><span class="ic">${ic("i-send")}</span></div><h3>Asynchronous case input</h3><p>Between sessions, submit an anonymised case and get a documented response from the relevant panel member.</p></div>
            <div class="tile"><div class="th"><span class="ic">${ic("i-cap")}</span></div><h3>Reflection & CPD</h3><p>Sessions generate genuine reflective material — useful for revalidation and your own development.</p></div>
            <div class="tile"><div class="th"><span class="ic">${ic("i-play")}</span></div><h3>Recorded & referenceable</h3><p>With consent and anonymisation, discussions build into a searchable library of learning.</p></div>
          </div>

          <div class="sec-title" style="margin-top:26px"><h2 class="h">Next session agenda</h2></div>
          <div class="card pad"><ul class="feed">
            ${ns.agenda.map((a, i) => `<li><span class="fi">${i + 1}</span><div class="ft">${esc(a)}</div></li>`).join("")}
          </ul></div>

          <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn" id="newCase">${ic("i-send")} Submit a case</button>
            <button class="btn ghost" id="goLib">${ic("i-play")} Browse session library</button>
          </div>
        </div>

        <div>
          <div class="sec-title"><h2 class="h">The panel</h2></div>
          <div class="panel-list">
            ${D.panel.map(p => `<div class="pmember ${/chair/i.test(p.role) ? "chair" : ""}">
              <span class="av">${esc(p.initials)}</span>
              <div class="bd"><b>${esc(p.name)}</b><small>${esc(p.role)} · ${esc(p.specialty)}</small></div>
            </div>`).join("")}
          </div>
          <div class="disc" style="margin-top:14px">${ic("i-shield")} The MDT is a peer-support and supervision resource — advisory input, not a transfer of clinical responsibility. The treating prescriber remains the decision-maker throughout.</div>
        </div>
      </div>`;
    $("#newCase", v).addEventListener("click", () => openCaseModal());
    $("#goLib", v).addEventListener("click", () => go("library"));
  };

  /* ============================================================
     VIEW: My cases  (Pillar 2)
     ============================================================ */
  VIEWS.cases = (v) => {
    const render = () => {
      const cs = allCases();
      v.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
          <div class="anon-note" style="flex:1;min-width:260px">${ic("i-shield")}<span>Submit <b>anonymised</b> cases only. ClinicAlly strips identifiers in the live product; never include names, DOB or NHS numbers.</span></div>
          <button class="btn" id="addCase">${ic("i-plus")} New case</button>
        </div>
        <div class="grid" id="caseList">${cs.map(caseCard).join("")}</div>`;
      $("#addCase", v).addEventListener("click", () => openCaseModal());
    };
    render();
    window.__refreshCases = render;
  };

  function caseCard(c) {
    const answered = c.status === "Answered";
    return `<div class="case">
      <div class="ch">
        <span class="ic" style="width:34px;height:34px;border-radius:9px;background:var(--brand-soft);color:var(--brand-deep);display:grid;place-items:center;flex:0 0 auto">${ic("i-inbox")}</span>
        <b>${esc(c.title)}</b>
        <span style="margin-left:auto" class="tag ${answered ? "ok" : "warn"}">${esc(c.status)}</span>
      </div>
      <div class="cb">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <span class="tag">${esc(c.specialty)}</span><span class="tag">${esc(c.id)}</span><span class="tag">Submitted ${esc(fmtDate(c.submitted))}</span>
        </div>
        <div class="lbl">Case summary</div>
        <p>${esc(c.summary)}</p>
        ${answered ? `<div class="resp"><div class="rh"><span class="tag teal">${ic("i-people")} ${esc(c.responder)}</span><b>Panel response</b></div><p style="font-size:.86rem;color:var(--ink-2);line-height:1.55">${esc(c.response)}</p></div>`
        : `<div class="pending">${ic("i-clock")} Awaiting ${esc(c.responder || "the panel")} — typically responded within the cycle.</div>`}
      </div>
    </div>`;
  }

  function openCaseModal(prefill) {
    prefill = prefill || {};
    const specialties = D.panel.map(p => p.specialty);
    const body = `
      <div class="anon-note" style="margin-bottom:16px">${ic("i-shield")}<span>Anonymised submission. Do not include any patient-identifiable information.</span></div>
      <form class="form" id="caseForm" style="max-width:none">
        <div class="field"><label>Case title <span class="req">*</span></label>
          <input class="input" name="title" required value="${esc(prefill.title || "")}" placeholder="e.g. Uncertain rosacea vs. perioral dermatitis"></div>
        <div class="two">
          <div class="field"><label>Relevant specialty</label>
            <select class="select" name="specialty">${specialties.map(s => `<option ${prefill.specialty && (s.toLowerCase().includes(prefill.specialty.toLowerCase()) || prefill.specialty.toLowerCase().includes(s.toLowerCase())) ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Urgency</label>
            <select class="select" name="urgency"><option>Routine — next session</option><option>Sooner if possible</option></select></div>
        </div>
        <div class="field"><label>Anonymised case summary <span class="req">*</span></label>
          <div class="help">Age, sex, presentation, what you've considered and your specific question.</div>
          <textarea class="textarea" name="summary" required placeholder="29F, 6 weeks on lisdexamfetamine 30mg…">${esc(prefill.summary || "")}</textarea></div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn ghost" data-cancel>Cancel</button>
          <button type="submit" class="btn">${ic("i-send")} Submit to MDT</button>
        </div>
      </form>`;
    modal("Submit a case to the MDT", body, (bg, close) => {
      $("[data-cancel]", bg).addEventListener("click", close);
      $("#caseForm", bg).addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const spec = fd.get("specialty");
        const responder = (D.panel.find(p => p.specialty === spec) || {}).name;
        const id = "C-" + (240 + state.cases.length);
        state.cases.unshift({
          id, title: fd.get("title"), specialty: spec, submitted: today(),
          status: "Awaiting panel", responder, summary: fd.get("summary"), response: null
        });
        save(); buildSidebar();
        close();
        toast(`Case ${id} submitted to ${responder || "the panel"}.`);
        if (window.__refreshCases && location.hash === "#cases") window.__refreshCases();
        else go("cases");
      });
    });
  }

  /* ============================================================
     VIEW: Session library
     ============================================================ */
  VIEWS.library = (v) => {
    const row = (l) => `<button class="litem" data-lib="${l.id}">
        <span class="ic">${ic("i-play")}</span>
        <span class="bd"><b>${esc(l.title)}</b><small>${esc(l.panel)} · ${l.tags.map(esc).join(", ")}</small></span>
        <span class="meta">${esc(fmtDate(l.date))}<br>${l.mins} min</span>
      </button>`;
    v.innerHTML = `
      <div class="search"><svg viewBox="0 0 24 24">${useGlyph("i-search")}</svg><input id="lq" placeholder="Search recorded sessions…"></div>
      <div class="list" id="llist">${D.library.map(row).join("")}</div>`;
    const bind = () => v.querySelectorAll("[data-lib]").forEach(b => b.addEventListener("click", () => {
      const l = D.library.find(x => x.id === b.dataset.lib);
      modal(esc(l.title), `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span class="tag teal">${ic("i-people")} ${esc(l.panel)}</span><span class="tag">${esc(fmtDate(l.date))}</span><span class="tag">${l.mins} min</span></div>
        <div style="background:#0C2C2A;border-radius:12px;aspect-ratio:16/9;display:grid;place-items:center;color:#7FE9DF">${ic("i-play", "")}<span style="position:absolute"></span></div>
        <p class="muted" style="font-size:.86rem;margin-top:14px;line-height:1.6">Recorded MDT discussion, anonymised and consented. In the live product this plays the session with chaptered notes and links to the guidelines referenced.</p>
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">${l.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>`);
    }));
    bind();
    $("#lq", v).addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const f = D.library.filter(l => (l.title + l.panel + l.tags.join(" ")).toLowerCase().includes(q));
      $("#llist", v).innerHTML = f.length ? f.map(row).join("") : `<div class="empty">No sessions match your search.</div>`;
      bind();
    });
  };

  /* ============================================================
     helpers
     ============================================================ */
  function useGlyph(id) { return `<use href="#${id}"/>`; }
  function today() { const d = new Date(); return d.toISOString().slice(0, 10); }
  function fmtDate(s) {
    try { const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return s; }
  }

  init();
})();
