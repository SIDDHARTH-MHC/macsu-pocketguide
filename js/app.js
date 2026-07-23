/**
 * MAC Pocket Guide 2026 - client-side router + renderers
 * All updatable content lives in data/guide.json
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let DATA = null;
let societyFilter = "All";
let societyQuery = "";

function path() {
  const h = location.hash.replace(/^#/, "") || "/";
  return h.startsWith("/") ? h : `/${h}`;
}

function navigate(to) {
  location.hash = to.startsWith("#") ? to : `#${to}`;
}

function fmtPhone(p) {
  if (!p) return "";
  const d = String(p).replace(/\D/g, "");
  if (d.length <= 4 || d.startsWith("1800")) return p;
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d.slice(0, 2)} ${d.slice(2, 7)} ${d.slice(7)}`;
  return p;
}

function telHref(p) {
  const d = String(p).replace(/\D/g, "");
  if (!d) return null;
  if (d.length <= 4 || d.startsWith("1800") || d.startsWith("112") || d.startsWith("181")) {
    return `tel:${d}`;
  }
  return `tel:+91${d.length === 10 ? d : d.replace(/^91/, "")}`;
}

function waHref(p, text = "") {
  const d = String(p).replace(/\D/g, "");
  if (!d) return null;
  const num = d.length === 10 ? `91${d}` : d.replace(/^0/, "91");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${num}${q}`;
}

function money(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function igIcon(size = 16) {
  return `<svg class="ig-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 7.2A4.8 4.8 0 1016.8 12 4.8 4.8 0 0012 7.2zm0 7.9A3.1 3.1 0 1115.1 12 3.1 3.1 0 0112 15.1z"/><circle cx="17.5" cy="6.5" r="1.2"/><path d="M12 2.5c-2.6 0-2.9 0-3.9.1a6.4 6.4 0 00-4.5 4.5C3.5 8.1 3.5 8.4 3.5 12s0 3.9.1 3.9a6.4 6.4 0 004.5 4.5c1 .1 1.3.1 3.9.1s3.9 0 3.9-.1a6.4 6.4 0 004.5-4.5c.1-1 .1-1.3.1-3.9s0-3.9-.1-3.9a6.4 6.4 0 00-4.5-4.5C15.9 2.5 15.6 2.5 12 2.5zm0 1.8c2.5 0 2.8 0 3.8.1a4.6 4.6 0 013.2 3.2c.1 1 .1 1.3.1 3.8s0 2.8-.1 3.8a4.6 4.6 0 01-3.2 3.2c-1 .1-1.3.1-3.8.1s-2.8 0-3.8-.1a4.6 4.6 0 01-3.2-3.2c-.1-1-.1-1.3-.1-3.8s0-2.8.1-3.8a4.6 4.6 0 013.2-3.2c1-.1 1.3-.1 3.8-.1z"/></svg>`;
}

function igLink(handle, url, label) {
  if (!handle && !url) return "";
  const href = url || `https://www.instagram.com/${handle}/`;
  const text = label || (handle ? `Follow @${handle}` : "Follow on Instagram");
  return `<a class="ig-btn" href="${esc(href)}" target="_blank" rel="noopener">${igIcon(15)}<span>${esc(text)}</span></a>`;
}

function homeIcon(kind) {
  const icons = {
    reach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/><path d="M12 3v1.2M12 19.8V21M3 12h1.2M19.8 12H21"/></svg>`,
    call: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6.5 3.8h3.2l1.2 4.1-2 1.2a11.5 11.5 0 005 5l1.2-2 4.1 1.2v3.2A2 2 0 0117.2 19 14.5 14.5 0 015 6.8a2 2 0 011.5-3z"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"/></svg>`,
    people: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 18.5a5.5 5.5 0 0111 0"/><circle cx="17" cy="9" r="2.4"/><path d="M14.2 18.5a4.4 4.4 0 016.3-2.8"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4.5h11.5A2.5 2.5 0 0119 7v12.5H7A2 2 0 015 17.5v-13z"/><path d="M5 17.5h12"/></svg>`,
    union: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l2.2 4.5L19 8.4l-3.5 3.4.8 4.7L12 14.5 7.7 16.5l.8-4.7L5 8.4l4.8-.9L12 3z"/></svg>`,
    help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.6-7 10-7 10z"/></svg>`,
    fest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 19h14M7 19V9l5-4 5 4v10"/><path d="M10 19v-5h4v5"/></svg>`,
    fees: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.5"/><path d="M4 10h16M8 14h3"/></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 4.5l6-1.5 5 2v14.5l-5-2-6 1.5-5-2V5z"/><path d="M9 4.5v14.5M15 3v14.5"/></svg>`,
  };
  return icons[kind] || icons.home;
}

function contactActions(m, opts = {}) {
  const bits = [];
  if (m.phone) {
    if (opts.whatsappChoice) {
      bits.push(`<button type="button" class="tap tap-phone" data-phone="${esc(m.phone)}" data-name="${esc(m.name || "")}">${esc(fmtPhone(m.phone))}</button>`);
    } else {
      bits.push(`<a class="tap" href="${telHref(m.phone)}">${esc(fmtPhone(m.phone))}</a>`);
    }
  }
  if (m.email) {
    bits.push(`<a class="tap" href="mailto:${esc(m.email)}">Email</a>`);
  }
  if (m.instagramUrl || m.instagram) {
    bits.push(igLink(m.instagram, m.instagramUrl, m.instagram ? `@${m.instagram}` : "Instagram"));
  }
  return bits.join("");
}

function waBanner(d, variant = "default") {
  if (!d.meta.whatsappGroupUrl) return "";
  const cls = variant === "hero" ? "wa-hero" : variant === "sticky" ? "wa-sticky" : "wa-banner";
  if (variant === "hero") {
    return `
    <a class="wa-hero" href="${esc(d.meta.whatsappGroupUrl)}" target="_blank" rel="noopener">
      <span class="wa-hero-kicker">Step 1 - do this first</span>
      <span class="wa-hero-title">${esc(d.meta.whatsappGroupLabel || "Join our WhatsApp group")}</span>
      <span class="wa-hero-sub">${esc(d.meta.whatsappGroupSub || "All updates in one place.")}</span>
      <span class="wa-hero-cta">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 00-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1012.04 2zm5.76 14.05c-.24.68-1.4 1.24-1.93 1.32-.5.07-1.13.1-1.82-.11a10.5 10.5 0 01-3.28-1.94 11.4 11.4 0 01-3.3-4.2c-.35-.66-.05-1.24.23-1.53.23-.24.5-.3.67-.3h.5c.16 0 .38-.06.6.46.24.55.8 1.95.87 2.1.07.14.12.3.02.49-.1.19-.15.3-.29.46-.14.15-.3.34-.43.46-.14.12-.29.26-.12.5.16.25.72 1.18 1.55 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.17-.2.7-.81.89-1.09.19-.28.38-.23.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.11.07.66-.17 1.34z"/></svg>
        Join WhatsApp group
      </span>
    </a>`;
  }
  return `
    <a class="${cls}" href="${esc(d.meta.whatsappGroupUrl)}" target="_blank" rel="noopener">
      <span class="wa-banner-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 00-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1012.04 2zm5.76 14.05c-.24.68-1.4 1.24-1.93 1.32-.5.07-1.13.1-1.82-.11a10.5 10.5 0 01-3.28-1.94 11.4 11.4 0 01-3.3-4.2c-.35-.66-.05-1.24.23-1.53.23-.24.5-.3.67-.3h.5c.16 0 .38-.06.6.46.24.55.8 1.95.87 2.1.07.14.12.3.02.49-.1.19-.15.3-.29.46-.14.15-.3.34-.43.46-.14.12-.29.26-.12.5.16.25.72 1.18 1.55 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.17-.2.7-.81.89-1.09.19-.28.38-.23.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.11.07.66-.17 1.34z"/></svg>
      </span>
      <span class="wa-banner-label">${esc(d.meta.whatsappGroupLabel || "Join our WhatsApp group")}</span>
      <span class="wa-banner-cta">Join</span>
    </a>`;
}

function updateStickyWa() {
  const bar = $("#wa-sticky");
  if (!bar || !DATA?.meta?.whatsappGroupUrl) return;
  bar.href = DATA.meta.whatsappGroupUrl;
  bar.hidden = false;
}

/* -- Pages -- */

function renderHome(d) {
  const m = d.meta;
  const tiles = [
    { href: "#/reach", icon: "reach", title: "Reach MAC", sub: "Metro + Maps" },
    { href: "#/admissions", icon: "call", title: "Help Desk", sub: "Call / WhatsApp" },
    { href: "#/accommodation", icon: "home", title: "PG / Hostel", sub: "Where to stay" },
    { href: "#/societies", icon: "people", title: "Societies", sub: "Instagram links" },
    { href: "#/academics", icon: "book", title: "Academics", sub: "NEP + Fees" },
    { href: "#/union", icon: "union", title: "Student Union", sub: "Who we are" },
    { href: "#/help", icon: "help", title: "Help & Safety", sub: "Helplines" },
    { href: "#/union", icon: "fest", title: "Yuvaan", sub: "College fest" },
  ]
    .map(
      (t) => `
      <a class="icon-tile" href="${t.href}">
        <span class="icon-tile-svg">${homeIcon(t.icon)}</span>
        <strong>${esc(t.title)}</strong>
        <span>${esc(t.sub)}</span>
      </a>`
    )
    .join("");

  return `
    <article class="cover cover-lazy">
      <div class="cover-head">
        <span class="cover-stamp">Freshies ${esc(m.year)}</span>
        <p class="college">${esc(m.college)}</p>
        <h1>Pocket Guide</h1>
        <p class="presented">${esc(m.presentedBy)}</p>
      </div>
      ${waBanner(d, "hero")}
      <p class="lazy-line">Already joined? Then tap what you need below.</p>
      <nav class="icon-grid" aria-label="Quick links">${tiles}</nav>
      <div class="home-actions">
        <a class="btn btn-wa btn-block" href="${esc(m.whatsappGroupUrl)}" target="_blank" rel="noopener">
          Still not in the group? Join WhatsApp
        </a>
        <a class="btn btn-primary btn-block" href="${esc(m.mapsUrl)}" target="_blank" rel="noopener">
          ${homeIcon("map")} Open in Google Maps
        </a>
        ${igLink(m.instagram, m.instagramUrl, `Follow @${m.instagram} on Instagram`)}
        <a class="btn btn-outline btn-block" href="#/admissions">Call Student Union Help Desk</a>
      </div>
      <p class="meta-row center">${esc(m.address)}</p>
      <p class="footer-credit" style="border:none;margin-top:1rem">
        <strong>${esc(d.credits.built)}</strong>
      </p>
    </article>`;
}

function renderReach(d) {
  const stations = d.reach.metroStations
    .map(
      (s) => `
      <li class="metro-card">
        <strong class="metro-name">${esc(s.name)}</strong>
        <span class="metro-line">${esc(s.line)}</span>
        <span class="metro-note">${esc(s.note)}</span>
      </li>`
    )
    .join("");
  const modes = d.reach.modes
    .map(
      (m) => `
      <div class="mode">
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.body)}</p>
      </div>`
    )
    .join("");
  return `
    <header class="page-head">
      <h1>How to reach MAC</h1>
      <p>${esc(d.reach.intro)}</p>
    </header>
    <h2 class="section-label">Nearest Metro Stations</h2>
    <ul class="metro-grid" aria-label="Nearest metro stations">${stations}</ul>
    <div class="tip">
      <strong>E-rickshaw from metro</strong>
      ${esc(d.reach.erickshaw)}
    </div>
    ${modes}
    <p class="prose">${esc(d.reach.closing)}</p>
    <a class="btn btn-primary btn-block" href="${esc(d.meta.mapsUrl)}" target="_blank" rel="noopener">
      Open in Google Maps
    </a>`;
}

function renderAccommodation(d) {
  const a = d.accommodation;
  const areas = (a.where?.areas || [])
    .map((area) => `<li class="area-chip">${esc(area)}</li>`)
    .join("");
  const lookFor = (a.where?.lookFor || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const donts = (a.donts?.items || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const pack = (a.packing?.items || a.mustBring || [])
    .map(
      (b) => `
      <details>
        <summary>${esc(b.cat)}</summary>
        <div class="acc-body">${esc(b.items)}</div>
      </details>`
    )
    .join("");

  return `
    <header class="page-head">
      <h1>Where to stay</h1>
      <p>${esc(a.intro)}</p>
    </header>

    <h2 class="section-label">${esc(a.where.title)}</h2>
    <p class="prose">${esc(a.where.hostel)}</p>
    <p class="prose"><strong>Best areas near MAC</strong></p>
    <ul class="area-list">${areas}</ul>
    <p class="fee-note">${esc(a.where.areasNote)}</p>
    <div class="acc">
      <details open>
        <summary>What to look for</summary>
        <div class="acc-body"><ul>${lookFor}</ul></div>
      </details>
    </div>

    <h2 class="section-label">${esc(a.donts.title)}</h2>
    <ul class="dont-list">${donts}</ul>

    <h2 class="section-label">${esc(a.packing.title)}</h2>
    <p class="prose">${esc(a.packing.intro || "")}</p>
    <div class="acc">${pack}</div>`;
}

function renderSocieties(d) {
  const cats = ["All", ...new Set(d.societies.map((s) => s.cat))];
  const chips = cats
    .map(
      (c) =>
        `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === societyFilter}">${esc(c)}</button>`
    )
    .join("");

  const q = societyQuery.trim().toLowerCase();
  const list = d.societies.filter((s) => {
    const catOk = societyFilter === "All" || s.cat === societyFilter;
    const hay = `${s.name} ${s.desc} ${s.instagram || ""}`.toLowerCase();
    const qOk = !q || hay.includes(q);
    return catOk && qOk;
  });

  const items = list.length
    ? list
        .map((s) => {
          const ig = s.instagram
            ? igLink(s.instagram, null, `Follow @${s.instagram}`)
            : "";
          return `
        <li>
          <span class="s-name">${esc(s.name)}</span>
          <span class="s-cat">${esc(s.cat)}</span>
          <p class="s-desc">${esc(s.desc)}</p>
          ${ig}
        </li>`;
        })
        .join("")
    : `<li class="empty">No societies match - try another filter.</li>`;

  const sports = d.sports
    .map((s) => {
      const name = typeof s === "string" ? s : s.name;
      const desc = typeof s === "string" ? "" : s.desc || "";
      const handle = typeof s === "object" && s.instagram ? s.instagram : "";
      const igBtn = handle ? igLink(handle, null, `Follow @${handle}`) : "";
      return `
        <li class="sport-item">
          <span class="sport-tag">${esc(name)}</span>
          ${desc ? `<span class="sport-desc">${esc(desc)}</span>` : ""}
          ${igBtn}
        </li>`;
    })
    .join("");

  return `
    <header class="page-head">
      <h1>Societies &amp; Sports</h1>
      <p>Tap Follow to open Instagram. Auditions land in the first weeks.</p>
      ${igLink(d.meta.instagram, d.meta.instagramUrl, `Follow @${d.meta.instagram}`)}
    </header>
    <label class="sr-only" for="society-search">Filter societies</label>
    <input type="search" id="society-search" placeholder="Search by name or Instagram…" value="${esc(societyQuery)}" />
    <div class="filters" role="group" aria-label="Category">${chips}</div>
    <ul class="society-list">${items}</ul>
    <h2 class="section-label">Sports teams</h2>
    <ul class="sports-list">${sports}</ul>
    <p class="prose">Trials and contacts get posted each season - ask seniors or the union office.</p>`;
}

function renderAcademics(d) {
  const el = d.academics.electives
    .map(
      (e) => `
      <details>
        <summary><span>${esc(e.code)} - ${esc(e.title)}</span></summary>
        <div class="acc-body">${esc(e.body)}</div>
      </details>`
    )
    .join("");

  const fees = d.fees.courses
    .map(
      (c) => `
      <tr><td>${esc(c.name)}</td><td>${money(c.total)}</td></tr>`
    )
    .join("");

  const breakdown = d.fees.breakdown
    .map((b) => `<li><strong>${esc(b.item)}:</strong> ${esc(b.amount)}</li>`)
    .join("");

  const faq = d.faq
    .map(
      (f) => `
      <details>
        <summary>${esc(f.q)}</summary>
        <div class="acc-body">${esc(f.a)}</div>
      </details>`
    )
    .join("");

  const ba = d.academics.baProg;

  return `
    <header class="page-head">
      <h1>Academics</h1>
      <p>NEP electives, BA Prog structure, fees 2026-27.</p>
    </header>
    <h2 class="section-label">Electives (NEP 2020)</h2>
    <div class="acc">${el}</div>
    <p class="prose">${esc(d.academics.electivesNote)}</p>
    <h2 class="section-label">${esc(ba.title)}</h2>
    <p class="prose">${esc(ba.body)}</p>
    <ul class="prose">${ba.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    <div class="example">
      <h4>${esc(ba.example.title)}</h4>
      <ol>${ba.example.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    </div>
    <h2 class="section-label">Fee structure 2026-27 (1st year)</h2>
    <table class="fee-table">
      <thead><tr><th>Course</th><th>Total</th></tr></thead>
      <tbody>${fees}</tbody>
    </table>
    <div class="acc">
      <details>
        <summary>See component breakdown</summary>
        <div class="acc-body"><ul>${breakdown}</ul></div>
      </details>
    </div>
    <p class="fee-note">${esc(d.fees.note)}</p>
    <h2 class="section-label">FAQ</h2>
    <div class="acc">${faq}</div>`;
}

function renderUnion(d) {
  const members = d.union.members
    .map((m) => {
      const photo = m.photo
        ? `<img class="union-photo" src="${esc(m.photo)}" alt="${esc(m.name)}" width="120" height="150" loading="lazy" />`
        : `<div class="union-photo placeholder" aria-hidden="true"></div>`;
      const ig = m.instagramUrl
        ? igLink(m.instagram, m.instagramUrl, `Follow @${m.instagram}`)
        : "";
      const phone = m.phone
        ? `<button type="button" class="tap tap-phone" data-phone="${esc(m.phone)}" data-name="${esc(m.name)}">${esc(fmtPhone(m.phone))}</button>`
        : "";
      return `
      <article class="union-card">
        ${photo}
        <div class="union-card-body">
          <span class="role">${esc(m.role)}</span>
          <span class="name">${esc(m.name)}</span>
          <div class="union-actions">${ig}${phone}</div>
        </div>
      </article>`;
    })
    .join("");

  const fest = d.fest
    ? `
    <h2 class="section-label">${esc(d.fest.name)} - College Fest</h2>
    <p class="prose">${esc(d.fest.body)}</p>
    ${igLink(d.fest.instagram, d.fest.instagramUrl, `Follow @${d.fest.instagram}`)}`
    : "";

  return `
    <header class="page-head">
      <h1>Student Union</h1>
      <p>${esc(d.union.credit)}</p>
    </header>
    ${d.union.teamPhoto ? `<img class="team-banner" src="${esc(d.union.teamPhoto)}" alt="MAC Student Union team" width="640" height="400" loading="lazy" />` : ""}
    <p class="prose">${esc(d.union.intro)}</p>
    <p class="prose">${esc(d.union.howWeHelp || "")}</p>
    <h2 class="section-label">Elected members 2025-26</h2>
    <div class="union-cards">${members}</div>
    ${fest}
    <h2 class="section-label">Follow MACSU</h2>
    ${igLink(d.meta.instagram, d.meta.instagramUrl, `Follow @${d.meta.instagram} on Instagram`)}
    <div style="height:0.5rem"></div>
    ${igLink(d.meta.abvpInstagram, d.meta.abvpInstagramUrl, `Follow @${d.meta.abvpInstagram}`)}
    <p class="meta-row" style="margin-top:1rem">
      <a href="mailto:${esc(d.meta.emailAlt)}">${esc(d.meta.emailAlt)}</a>
      · ${esc(d.union.office || "Union office on campus")}
    </p>
    <p class="meta-row">
      Also: <a href="mailto:${esc(d.meta.email)}">${esc(d.meta.email)}</a>
    </p>`;
}

function renderAdmissions(d) {
  const helps = d.admissionHelp.helpsWith.map((h) => `<li>${esc(h)}</li>`).join("");
  const team = d.admissionHelp.team
    .map(
      (t) => `
      <li>
        <div class="name">
          ${esc(t.name)}
          ${t.note ? `<span class="role">${esc(t.note)}</span>` : ""}
        </div>
        ${contactActions(t, { whatsappChoice: true })}
      </li>`
    )
    .join("");
  return `
    <header class="page-head">
      <h1>Admission Help</h1>
      <p>${esc(d.admissionHelp.intro)}</p>
    </header>
    ${waBanner(d, "hero")}
    <h2 class="section-label">What we help with</h2>
    <ul class="prose">${helps}</ul>
    <h2 class="section-label">Student Union Help Desk</h2>
    <p class="fee-note">Tap a number to Call or message on WhatsApp.</p>
    <ul class="contact-list">${team}</ul>
    <p class="meta-row">
      Email: <a href="mailto:${esc(d.meta.emailAlt)}">${esc(d.meta.emailAlt)}</a>
      · <a href="mailto:${esc(d.meta.email)}">${esc(d.meta.email)}</a>
    </p>
    <p class="meta-row">
      ${igLink(d.meta.instagram, d.meta.instagramUrl, `Follow @${d.meta.instagram}`)}
    </p>`;
}

function renderCommittee(c) {
  const members = (c.members || [])
    .map(
      (m) => `
      <li>
        <div class="name">
          ${esc(m.name)}
          ${m.role ? `<span class="role">${esc(m.role)}</span>` : ""}
        </div>
        ${contactActions(m)}
      </li>`
    )
    .join("");
  return `
    <div class="committee">
      <span class="badge-verify badge-ok">From MAC website</span>
      <h3>${esc(c.name)}</h3>
      <p class="purpose">${esc(c.purpose)}</p>
      ${members ? `<ul class="contact-list">${members}</ul>` : ""}
      ${c.email ? `<p class="meta-row"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ""}
      ${c.extra ? `<p class="prose">${esc(c.extra)}</p>` : ""}
      ${c.link ? `<p class="meta-row"><a href="${esc(c.link)}" target="_blank" rel="noopener">Official notice →</a></p>` : ""}
    </div>`;
}

function renderHelp(d) {
  const committees = (d.committees.items || []).map((c) => renderCommittee(c)).join("");
  const emergency = d.emergency
    .map((e) => {
      if (e.phone) {
        return `<li><div class="name">${esc(e.label)}</div><a class="tap" href="${telHref(e.phone)}">${esc(fmtPhone(e.phone) || e.phone)}</a></li>`;
      }
      return `<li><div class="name">${esc(e.label)}</div><a class="tap" href="mailto:${esc(e.email)}">${esc(e.email)}</a></li>`;
    })
    .join("");
  const conduct = d.conduct
    .map(
      (c) => `
      <details>
        <summary>${esc(c.title)}</summary>
        <div class="acc-body">${esc(c.body)}</div>
      </details>`
    )
    .join("");
  const first = d.firstWeek.map((f) => `<li>${esc(f)}</li>`).join("");

  return `
    <header class="page-head">
      <h1>Help &amp; Safety</h1>
      <p>Helplines, first-week survival, code of conduct, and latest college committees.</p>
    </header>
    <h2 class="section-label">Emergency &amp; complaint IDs</h2>
    <div class="tip">
      <strong>Main college complaint ID</strong>
      For college-level complaints, write to the Principal:
      <a href="mailto:principal@mac.du.ac.in">principal@mac.du.ac.in</a>
    </div>
    <ul class="contact-list">${emergency}</ul>
    <h2 class="section-label">First week survival</h2>
    ${waBanner(d)}
    <ul class="prose">${first}</ul>
    <h2 class="section-label">College committees</h2>
    <p class="fee-note">${esc(d.committees.source || "")}</p>
    ${committees}
    <p class="prose">${esc(d.committees.fallback)}</p>
    <p class="meta-row">
      <a href="${esc(d.meta.collegeCommitteesUrl)}" target="_blank" rel="noopener">All committees on mac.du.ac.in →</a>
    </p>
    <h2 class="section-label">Code of Conduct</h2>
    <div class="acc">${conduct}</div>
    <p class="meta-row" style="margin-top:1.5rem">
      <a href="#/admissions">Student Union Help Desk →</a>
      · <a href="#/union">Student Union →</a>
    </p>`;
}

function renderMenu(d) {
  const links = [
    ["Home", "/"],
    ["Reach Campus", "/reach"],
    ["Admission Help", "/admissions"],
    ["Accommodation", "/accommodation"],
    ["Societies & Sports", "/societies"],
    ["Academics & Fees", "/academics"],
    ["Student Union", "/union"],
    ["Help & Safety", "/help"],
    ["About / Credits", "/about"],
  ];
  return `
    <header class="page-head">
      <h1>All sections</h1>
      <p>Every corner of the pocket guide.</p>
    </header>
    <ul class="menu-list">
      ${links.map(([label, href]) => `<li><a href="#${href}">${esc(label)}</a></li>`).join("")}
    </ul>
    <p class="footer-credit">
      <strong>${esc(d.credits.built)}</strong>
      ${esc(d.meta.college)} · ${esc(d.meta.university)}
    </p>`;
}

function renderAbout(d) {
  return `
    <header class="page-head">
      <h1>About</h1>
      <p>${esc(d.meta.presentedBy)}</p>
    </header>
    <p class="prose">${esc(d.credits.built)}</p>
    <p class="meta-row">${esc(d.meta.address)}</p>
    <p class="meta-row">
      <a href="${esc(d.meta.instagramUrl)}" target="_blank" rel="noopener">@${esc(d.meta.instagram)}</a>
      · <a href="mailto:${esc(d.meta.email)}">${esc(d.meta.email)}</a>
      · <a href="mailto:${esc(d.meta.emailAlt)}">${esc(d.meta.emailAlt)}</a>
    </p>`;
}

const ROUTES = {
  "/": renderHome,
  "/home": renderHome,
  "/reach": renderReach,
  "/accommodation": renderAccommodation,
  "/societies": renderSocieties,
  "/campus": renderSocieties,
  "/academics": renderAcademics,
  "/union": renderUnion,
  "/admissions": renderAdmissions,
  "/help": renderHelp,
  "/grievance": renderHelp,
  "/conduct": renderHelp,
  "/emergency": renderHelp,
  "/menu": renderMenu,
  "/about": renderAbout,
};

function setActiveNav(p) {
  $$(".nav-item").forEach((el) => el.classList.remove("active"));
  let key = "menu";
  if (p === "/" || p === "/home") key = "home";
  else if (p === "/reach") key = "reach";
  else if (p === "/societies" || p === "/campus") key = "societies";
  else if (["/help", "/emergency", "/conduct", "/grievance"].includes(p)) key = "help";
  $(`.nav-item[data-nav="${key}"]`)?.classList.add("active");
}

function pageTitle(p) {
  const map = {
    "/": "Pocket Guide",
    "/home": "Pocket Guide",
    "/reach": "Reach Campus",
    "/accommodation": "Where to stay",
    "/societies": "Societies",
    "/academics": "Academics",
    "/union": "Student Union",
    "/admissions": "Admission Help",
    "/help": "Help & Safety",
    "/menu": "Menu",
    "/about": "About",
  };
  return map[p] || "Pocket Guide";
}

function render() {
  if (!DATA) return;
  const p = path();
  const fn = ROUTES[p] || renderMenu;
  const main = $("#main");
  const body = fn(DATA);
  // Compact WhatsApp strip on inner pages (home + admissions use the big hero)
  const showTopWa = !["/", "/home", "/admissions"].includes(p);
  main.innerHTML = (showTopWa ? waBanner(DATA) : "") + body;
  $("#topbar-title").textContent = pageTitle(p);
  $("#btn-back").hidden = p === "/" || p === "/home";
  setActiveNav(p);
  document.title = `${pageTitle(p)} · MAC Pocket Guide`;
  updateStickyWa();
  bindPageEvents(p);
  window.scrollTo(0, 0);
}

function bindPageEvents(p) {
  if (p === "/societies" || p === "/campus") {
    $("#society-search")?.addEventListener("input", (e) => {
      societyQuery = e.target.value;
      render();
      const inp = $("#society-search");
      if (inp) {
        inp.focus();
        const len = inp.value.length;
        inp.setSelectionRange(len, len);
      }
    });
    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        societyFilter = chip.dataset.cat;
        render();
      });
    });
  }

  $$(".tap-phone").forEach((btn) => {
    btn.addEventListener("click", () => openPhoneSheet(btn.dataset.phone, btn.dataset.name));
  });
}

function openPhoneSheet(phone, name) {
  closePhoneSheet();
  const msg = `Hi${name ? ` ${name}` : ""}, I am a fresher at MAC and need help.`;
  const overlay = document.createElement("div");
  overlay.className = "sheet-overlay";
  overlay.id = "phone-sheet";
  overlay.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Contact options">
      <p class="sheet-title">${esc(name || "Help Desk")}</p>
      <p class="sheet-sub">${esc(fmtPhone(phone))}</p>
      <a class="btn btn-primary btn-block" href="${telHref(phone)}">Call</a>
      <a class="btn btn-wa btn-block" href="${waHref(phone, msg)}" target="_blank" rel="noopener">Text on WhatsApp</a>
      <button type="button" class="btn btn-outline btn-block" id="sheet-cancel">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePhoneSheet();
  });
  $("#sheet-cancel")?.addEventListener("click", closePhoneSheet);
}

function closePhoneSheet() {
  $("#phone-sheet")?.remove();
}

/* -- Search index -- */
function buildIndex(d) {
  const items = [];
  const add = (title, section, route, extra = "") => {
    items.push({ title, section, route, hay: `${title} ${section} ${extra}`.toLowerCase() });
  };
  add("Reach Campus", "Transit", "/reach", d.reach.intro);
  add("Accommodation", "Housing", "/accommodation");
  add("Societies", "Campus Life", "/societies");
  add("Sports Teams", "Campus Life", "/societies");
  add("Academics & Fees", "Academics", "/academics");
  add("BA Programme note", "Academics", "/academics");
  add("Student Union", "Union", "/union");
  add("Admission Help", "Admissions", "/admissions");
  add("Help & Safety", "Safety", "/help");
  add("Code of Conduct", "Safety", "/help");
  add("Emergency numbers", "Safety", "/help");
  d.societies.forEach((s) => add(s.name, "Society", "/societies", `${s.desc} ${s.instagram || ""}`));
  d.sports.forEach((s) => {
    const name = typeof s === "string" ? s : s.name;
    const extra = typeof s === "object" ? `${s.desc || ""} ${s.instagram || ""}` : "";
    add(name, "Sports", "/societies", extra);
  });
  add("Principal complaint", "Complaint", "/help", "principal@mac.du.ac.in");
  d.admissionHelp.team.forEach((t) => add(t.name, "Admission Help", "/admissions", t.phone));
  d.union.members.forEach((m) => add(m.name, m.role, "/union"));
  d.fees.courses.forEach((c) => add(c.name, "Fees", "/academics", String(c.total)));
  d.committees.items.forEach((c) => add(c.name, "Committee", "/help"));
  if (d.fest) add(d.fest.name, "Fest", "/union", d.fest.body);
  return items;
}

let INDEX = [];

function runSearch(q) {
  const box = $("#search-results");
  if (!q.trim()) {
    box.innerHTML = "";
    return;
  }
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = INDEX.filter((item) => terms.every((t) => item.hay.includes(t))).slice(0, 12);
  if (!hits.length) {
    box.innerHTML = `<li class="empty">No matches for “${esc(q)}”</li>`;
    return;
  }
  box.innerHTML = hits
    .map(
      (h) => `
      <li>
        <button type="button" data-route="${esc(h.route)}">
          <span class="hit-sec">${esc(h.section)}</span>
          ${esc(h.title)}
        </button>
      </li>`
    )
    .join("");
  $$("button[data-route]", box).forEach((btn) => {
    btn.addEventListener("click", () => {
      closeSearch();
      navigate(btn.dataset.route);
    });
  });
}

function openSearch() {
  const panel = $("#search-panel");
  panel.hidden = false;
  $("#search-input").focus();
}

function closeSearch() {
  $("#search-panel").hidden = true;
  $("#search-input").value = "";
  $("#search-results").innerHTML = "";
}

async function sharePage() {
  const url = location.href;
  const title = document.title;
  try {
    if (navigator.share) {
      await navigator.share({ title, url, text: "MAC Pocket Guide for Freshies - handy link from seniors." });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied - paste it on WhatsApp.");
    }
  } catch {
    /* user cancelled */
  }
}

async function init() {
  const res = await fetch("data/guide.json?v=16", { cache: "no-store" });
  DATA = await res.json();
  INDEX = buildIndex(DATA);

  $("#btn-back").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else navigate("/");
  });
  $("#btn-search").addEventListener("click", () => {
    if ($("#search-panel").hidden) openSearch();
    else closeSearch();
  });
  $("#btn-share").addEventListener("click", sharePage);
  $("#search-input").addEventListener("input", (e) => runSearch(e.target.value));

  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = "#/";
  else render();
}

init().catch((err) => {
  $("#main").innerHTML = `<p class="prose">Couldn't load the guide data. Check <code>data/guide.json</code>. (${esc(err.message)})</p>`;
});
