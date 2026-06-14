/* global chrome */
(() => {
  "use strict";

  const STORAGE_KEYS = {
    companionBaseUrl: "companionBaseUrl",
    degenDjUrl: "degenDjUrl",
    collapsed: "collapsed",
    activeTab: "activeTab",
    watchedItems: "watchedItems",
    watchedSellers: "watchedSellers",
    alphaNotes: "alphaNotes",
    dockPosition: "dockPosition",
  };
  const DEFAULTS = {
    companionBaseUrl: "http://localhost:3000",
    degenDjUrl: "http://localhost:5173",
    collapsed: false,
    activeTab: "market",
    watchedItems: ["wood"],
    watchedSellers: [],
    alphaNotes: "",
    dockPosition: "left",
  };
  const REFRESH_MS = 15000;

  let state = { ...DEFAULTS };
  let liveMarket = undefined;
  let marketError = undefined;
  let lastFetchAt = undefined;
  let refreshTimer = undefined;

  if (document.getElementById("kintara-companion-extension-root")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "kintara-companion-extension-root";
  host.setAttribute("data-read-only", "true");
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const app = document.createElement("div");

  shadow.appendChild(styleElement());
  shadow.appendChild(app);

  init();

  async function init() {
    state = { ...DEFAULTS, ...(await readStorage(Object.values(STORAGE_KEYS))) };
    render();
    await refreshMarket();
    scheduleRefresh();
    document.addEventListener("visibilitychange", scheduleRefresh);
  }

  function scheduleRefresh() {
    if (refreshTimer) {
      window.clearInterval(refreshTimer);
    }

    refreshTimer = window.setInterval(
      refreshMarket,
      document.hidden ? REFRESH_MS * 4 : REFRESH_MS,
    );
  }

  async function refreshMarket() {
    try {
      marketError = undefined;
      const response = await fetchLiveMarketViaExtension(state.companionBaseUrl);

      if (!response.ok) {
        throw new Error(response.error ?? "Companion API unavailable.");
      }

      liveMarket = response.payload;
      lastFetchAt = Date.now();
    } catch (error) {
      marketError = error instanceof Error ? error.message : String(error);
    }

    render();
  }

  function render() {
    app.className = [
      "kc-shell",
      `kc-pos--${state.dockPosition}`,
      state.collapsed ? "kc-shell--collapsed" : "",
    ].join(" ");
    app.innerHTML = state.collapsed ? collapsedMarkup() : expandedMarkup();
    bindEvents();
  }

  function collapsedMarkup() {
    return `
      <button class="kc-orb" type="button" data-action="toggle">
        <span class="kc-orb__mark">K</span>
        <span class="kc-orb__dot ${statusClass()}"></span>
      </button>
    `;
  }

  function expandedMarkup() {
    return `
      <section class="kc-panel" aria-label="Kintara Companion Overlay">
        <header class="kc-header">
          <div>
            <div class="kc-eyebrow">Read-only overlay</div>
            <h2>Kintara Companion</h2>
          </div>
          <div class="kc-header__actions">
            <span class="kc-status ${statusClass()}">${statusLabel()}</span>
            <button class="kc-icon-button" type="button" title="Move overlay" data-action="move">M</button>
            <button class="kc-icon-button" type="button" title="Refresh market" data-action="refresh">R</button>
            <button class="kc-icon-button" type="button" title="Collapse" data-action="toggle">-</button>
          </div>
        </header>

        <div class="kc-safety">
          READ ONLY - NO AUTOMATION - NO MARKETPLACE WRITES - NO WALLET SIGNATURES
        </div>

        <nav class="kc-tabs" aria-label="Companion sections">
          ${tabButton("market", "Market")}
          ${tabButton("watch", "Watch")}
          ${tabButton("dj", "Degen DJ")}
          ${tabButton("notes", "Alpha")}
        </nav>

        <main class="kc-body">
          ${tabPanel()}
        </main>
      </section>
    `;
  }

  function tabButton(id, label) {
    return `
      <button
        class="kc-tab ${state.activeTab === id ? "kc-tab--active" : ""}"
        type="button"
        data-tab="${escapeAttribute(id)}"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }

  function tabPanel() {
    if (state.activeTab === "watch") return watchPanel();
    if (state.activeTab === "dj") return degenPanel();
    if (state.activeTab === "notes") return notesPanel();

    return marketPanel();
  }

  function marketPanel() {
    const summary = liveMarket?.summary;
    const listings = liveMarket?.listings ?? [];
    const floors = summary?.topItemFloors ?? [];
    const biggest = summary?.biggestListings ?? listings.slice(0, 4);

    return `
      <section class="kc-section">
        ${marketError ? `<div class="kc-alert">Companion API unavailable: ${escapeHtml(marketError)}</div>` : ""}
        <div class="kc-grid kc-grid--stats">
          ${metric("Active", summary?.activeListings)}
          ${metric("KINS", summary?.tokenListings)}
          ${metric("Gold", summary?.goldListings)}
          ${metric("Types", summary?.uniqueItemTypes)}
        </div>

        <div class="kc-section-head">
          <h3>Top Floors</h3>
          <a href="${dashboardUrl("/market")}" target="_blank" rel="noreferrer">Open dashboard</a>
        </div>
        <div class="kc-list">
          ${floors.length ? floors.map(floorRow).join("") : empty("No floor data yet.")}
        </div>

        <div class="kc-section-head">
          <h3>Biggest Listings</h3>
        </div>
        <div class="kc-list">
          ${biggest.length ? biggest.slice(0, 5).map(listingRow).join("") : empty("No listings returned.")}
        </div>

        <p class="kc-muted">Last updated ${lastFetchAt ? `${secondsAgo(lastFetchAt)}s ago` : "never"}.</p>
      </section>
    `;
  }

  function watchPanel() {
    return `
      <section class="kc-section">
        <form class="kc-add-row" data-form="item">
          <input name="value" placeholder="item type, e.g. wood" autocomplete="off" />
          <button type="submit">Watch item</button>
        </form>
        <div class="kc-chip-list">
          ${state.watchedItems.length ? state.watchedItems.map((item) => watchChip("item", item)).join("") : empty("No watched items yet.")}
        </div>

        <form class="kc-add-row" data-form="seller">
          <input name="value" placeholder="seller name" autocomplete="off" />
          <button type="submit">Watch seller</button>
        </form>
        <div class="kc-chip-list">
          ${state.watchedSellers.length ? state.watchedSellers.map((seller) => watchChip("seller", seller)).join("") : empty("No watched sellers yet.")}
        </div>
      </section>
    `;
  }

  function degenPanel() {
    return `
      <section class="kc-section">
        <div class="kc-dj-card">
          <div>
            <div class="kc-eyebrow">Social room dock</div>
            <h3>Degen DJ</h3>
            <p>Run the room in a separate tab for uninterrupted audio while you play.</p>
          </div>
          <button class="kc-primary-button" type="button" data-action="open-degen-session">Full session</button>
        </div>
        <div class="kc-dj-actions">
          <a class="kc-secondary-link" href="${escapeAttribute(state.degenDjUrl)}" target="_blank" rel="noreferrer">Open source app</a>
          <button class="kc-secondary-button" type="button" data-action="reload-dj">Reload dock</button>
        </div>
        <iframe
          id="kc-degen-frame"
          class="kc-dj-frame"
          src="${escapeAttribute(state.degenDjUrl)}"
          title="Degen DJ room"
          allow="autoplay; clipboard-write"
          loading="lazy"
        ></iframe>
        <p class="kc-muted">Browser autoplay may require one click in the Degen room before music starts.</p>
      </section>
    `;
  }

  function notesPanel() {
    return `
      <section class="kc-section">
        <label class="kc-label" for="kc-alpha-notes">Local alpha notes</label>
        <textarea id="kc-alpha-notes" class="kc-notes" placeholder="Drop local notes, seller intel, or alpha here. Stored only in this browser.">${escapeHtml(state.alphaNotes)}</textarea>
        <div class="kc-warning">
          Local preview only. No background alerts, Discord, webhooks, marketplace actions, or wallet actions.
        </div>
      </section>
    `;
  }

  function metric(label, value) {
    return `
      <div class="kc-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${formatNumber(value)}</strong>
      </div>
    `;
  }

  function floorRow(floor) {
    const itemHref = dashboardUrl(`/market/${encodeURIComponent(floor.itemType)}`);

    return `
      <a class="kc-row" href="${itemHref}" target="_blank" rel="noreferrer">
        <span>
          <strong>${escapeHtml(displayItem(floor.itemName ?? floor.itemType))}</strong>
          <small>${escapeHtml(floor.currency ?? "market")}</small>
        </span>
        <b>${formatPrice(floor.floorPrice, floor.currency)}</b>
      </a>
    `;
  }

  function listingRow(listing) {
    const itemHref = dashboardUrl(`/market/${encodeURIComponent(listing.itemType)}`);
    const sellerHref = listing.seller
      ? dashboardUrl(`/seller/${encodeURIComponent(listing.seller)}`)
      : dashboardUrl("/market");

    return `
      <div class="kc-row">
        <a href="${itemHref}" target="_blank" rel="noreferrer">
          <strong>${escapeHtml(displayItem(listing.itemName ?? listing.itemType))}</strong>
          <small>x${formatNumber(listing.quantity)} - ${escapeHtml(listing.currency)}</small>
        </a>
        <a href="${sellerHref}" target="_blank" rel="noreferrer">${escapeHtml(shortName(listing.seller ?? "seller"))}</a>
      </div>
    `;
  }

  function watchChip(kind, value) {
    const href =
      kind === "item"
        ? dashboardUrl(`/market/${encodeURIComponent(value)}`)
        : dashboardUrl(`/seller/${encodeURIComponent(value)}`);

    return `
      <span class="kc-chip">
        <a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>
        <button type="button" title="Remove" data-remove-kind="${kind}" data-remove-value="${escapeAttribute(value)}">x</button>
      </span>
    `;
  }

  function empty(message) {
    return `<div class="kc-empty">${escapeHtml(message)}</div>`;
  }

  function bindEvents() {
    shadow.querySelectorAll("[data-action='toggle']").forEach((button) => {
      button.addEventListener("click", async () => {
        state.collapsed = !state.collapsed;
        await writeStorage({ [STORAGE_KEYS.collapsed]: state.collapsed });
        render();
      });
    });
    shadow.querySelector("[data-action='refresh']")?.addEventListener("click", refreshMarket);
    shadow.querySelector("[data-action='move']")?.addEventListener("click", async () => {
      state.dockPosition = nextDockPosition(state.dockPosition);
      await writeStorage({ [STORAGE_KEYS.dockPosition]: state.dockPosition });
      render();
    });
    shadow.querySelector("[data-action='open-degen-session']")?.addEventListener("click", () => {
      openDegenSession();
    });
    shadow.querySelector("[data-action='reload-dj']")?.addEventListener("click", () => {
      const frame = shadow.querySelector("#kc-degen-frame");

      if (frame) {
        frame.src = state.degenDjUrl;
      }
    });
    shadow.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", async () => {
        state.activeTab = button.getAttribute("data-tab") ?? "market";
        await writeStorage({ [STORAGE_KEYS.activeTab]: state.activeTab });
        render();
      });
    });
    shadow.querySelectorAll("[data-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const value = String(data.get("value") ?? "").trim();
        const kind = form.getAttribute("data-form");

        if (!value) return;
        if (kind === "item") {
          state.watchedItems = unique([value, ...state.watchedItems]);
          await writeStorage({ [STORAGE_KEYS.watchedItems]: state.watchedItems });
        } else {
          state.watchedSellers = unique([value, ...state.watchedSellers]);
          await writeStorage({ [STORAGE_KEYS.watchedSellers]: state.watchedSellers });
        }
        render();
      });
    });
    shadow.querySelectorAll("[data-remove-kind]").forEach((button) => {
      button.addEventListener("click", async () => {
        const kind = button.getAttribute("data-remove-kind");
        const value = button.getAttribute("data-remove-value");

        if (!value) return;
        if (kind === "item") {
          state.watchedItems = state.watchedItems.filter((item) => item !== value);
          await writeStorage({ [STORAGE_KEYS.watchedItems]: state.watchedItems });
        } else {
          state.watchedSellers = state.watchedSellers.filter((seller) => seller !== value);
          await writeStorage({ [STORAGE_KEYS.watchedSellers]: state.watchedSellers });
        }
        render();
      });
    });
    shadow.querySelector("#kc-alpha-notes")?.addEventListener("input", async (event) => {
      state.alphaNotes = event.target.value;
      await writeStorage({ [STORAGE_KEYS.alphaNotes]: state.alphaNotes });
    });
  }

  function readStorage(keys) {
    return new Promise((resolve) => {
      if (!chrome?.storage?.local) {
        resolve({});
        return;
      }

      chrome.storage.local.get(keys, resolve);
    });
  }

  function writeStorage(values) {
    return new Promise((resolve) => {
      if (!chrome?.storage?.local) {
        resolve();
        return;
      }

      chrome.storage.local.set(values, resolve);
    });
  }

  function fetchLiveMarketViaExtension(baseUrl) {
    return new Promise((resolve) => {
      if (!chrome?.runtime?.sendMessage) {
        resolve({ ok: false, error: "Extension background worker unavailable." });
        return;
      }

      chrome.runtime.sendMessage(
        { type: "KC_FETCH_LIVE_MARKET", baseUrl },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
            return;
          }

          resolve(response ?? { ok: false, error: "No extension response." });
        },
      );
    });
  }

  function openDegenSession() {
    if (!chrome?.runtime?.sendMessage) {
      window.open(state.degenDjUrl, "_blank", "noopener,noreferrer");
      return;
    }

    chrome.runtime.sendMessage(
      { type: "KC_OPEN_DEGEN_SESSION", degenDjUrl: state.degenDjUrl },
      (response) => {
        if (!response?.ok || chrome.runtime.lastError) {
          window.open(state.degenDjUrl, "_blank", "noopener,noreferrer");
        }
      },
    );
  }

  function dashboardUrl(path) {
    return `${trimSlash(state.companionBaseUrl)}${path}`;
  }

  function trimSlash(value) {
    return String(value || "").replace(/\/$/, "");
  }

  function statusClass() {
    if (marketError) return "kc-status--offline";
    if (!lastFetchAt) return "kc-status--stale";
    return Date.now() - lastFetchAt < 30000 ? "kc-status--live" : "kc-status--stale";
  }

  function statusLabel() {
    if (marketError) return "Offline";
    if (!lastFetchAt) return "Loading";
    return Date.now() - lastFetchAt < 30000 ? "Live" : "Stale";
  }

  function formatNumber(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  }

  function formatPrice(value, currency) {
    if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
    const suffix = currency === "token" ? "KINS" : currency ?? "gold";
    const number = currency === "token" ? `$${formatNumber(value)}` : formatNumber(value);

    return `${number} ${suffix}`;
  }

  function secondsAgo(timestamp) {
    return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  }

  function displayItem(value) {
    return String(value || "Unknown item").replace(/[_-]/g, " ");
  }

  function shortName(value) {
    const text = String(value || "");
    return text.length > 14 ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).slice(0, 50);
  }

  function nextDockPosition(position) {
    const positions = ["left", "right", "bottom-left", "bottom-right"];
    const index = positions.indexOf(position);

    return positions[(index + 1) % positions.length] ?? "left";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function styleElement() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      .kc-shell {
        position: fixed;
        z-index: 2147483647;
        width: min(390px, calc(100vw - 24px));
        color: #f8efd8;
        pointer-events: auto;
      }

      .kc-pos--left {
        left: 18px;
        top: 116px;
      }

      .kc-pos--right {
        right: 18px;
        top: 116px;
      }

      .kc-pos--bottom-left {
        left: 18px;
        bottom: 18px;
      }

      .kc-pos--bottom-right {
        right: 18px;
        bottom: 18px;
      }

      .kc-shell--collapsed {
        width: auto;
      }

      .kc-panel {
        overflow: hidden;
        border: 3px solid rgb(14 17 24 / 0.96);
        border-radius: 12px;
        background:
          linear-gradient(145deg, rgb(35 42 47 / 0.96), rgb(11 14 19 / 0.96)),
          #111827;
        box-shadow: 0 22px 70px rgb(0 0 0 / 0.55), inset 0 0 0 1px rgb(255 255 255 / 0.08);
      }

      .kc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 14px 14px 10px;
        border-bottom: 2px solid rgb(223 184 89 / 0.2);
      }

      .kc-header h2,
      .kc-dj-card h3,
      .kc-section-head h3 {
        margin: 0;
        letter-spacing: 0;
      }

      .kc-header h2 {
        font-size: 18px;
        line-height: 1.1;
      }

      .kc-eyebrow {
        color: #dfb859;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .kc-header__actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .kc-icon-button,
      .kc-orb {
        border: 2px solid rgb(255 255 255 / 0.18);
        background: rgb(255 255 255 / 0.08);
        color: #f8efd8;
        cursor: pointer;
      }

      .kc-icon-button {
        display: inline-flex;
        height: 32px;
        width: 32px;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: 900;
      }

      .kc-orb {
        position: relative;
        display: inline-flex;
        height: 54px;
        width: 54px;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: linear-gradient(145deg, #28402f, #10151d);
        box-shadow: 0 18px 44px rgb(0 0 0 / 0.45);
      }

      .kc-orb__mark {
        color: #dfb859;
        font-size: 22px;
        font-weight: 950;
      }

      .kc-orb__dot {
        position: absolute;
        right: -3px;
        top: -3px;
        height: 14px;
        width: 14px;
        border: 2px solid #0b0f16;
        border-radius: 50%;
      }

      .kc-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgb(255 255 255 / 0.16);
        border-radius: 999px;
        padding: 5px 8px;
        font-size: 11px;
        font-weight: 800;
      }

      .kc-status::before {
        content: "";
        height: 7px;
        width: 7px;
        border-radius: 999px;
        background: currentColor;
      }

      .kc-status--live {
        color: #6df0a7;
      }

      .kc-status--stale {
        color: #ffd166;
      }

      .kc-status--offline {
        color: #ff6b6b;
      }

      .kc-safety {
        margin: 12px 14px;
        border: 2px solid rgb(109 240 167 / 0.25);
        border-radius: 8px;
        background: rgb(12 70 46 / 0.32);
        color: #c7f8da;
        padding: 9px 10px;
        font-size: 11px;
        font-weight: 900;
        line-height: 1.35;
      }

      .kc-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 0 14px 12px;
      }

      .kc-tab {
        min-width: 0;
        border: 2px solid rgb(255 255 255 / 0.1);
        border-radius: 8px;
        background: rgb(255 255 255 / 0.06);
        color: #bcb6aa;
        cursor: pointer;
        font-size: 12px;
        font-weight: 850;
        padding: 8px 6px;
      }

      .kc-tab--active {
        border-color: rgb(223 184 89 / 0.55);
        background: rgb(223 184 89 / 0.14);
        color: #ffe7aa;
      }

      .kc-body {
        max-height: min(540px, calc(100vh - 170px));
        overflow: auto;
        padding: 0 14px 14px;
      }

      .kc-section {
        display: grid;
        gap: 12px;
      }

      .kc-grid {
        display: grid;
        gap: 8px;
      }

      .kc-grid--stats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .kc-metric {
        border: 2px solid rgb(255 255 255 / 0.1);
        border-radius: 8px;
        background: rgb(0 0 0 / 0.22);
        padding: 10px 8px;
      }

      .kc-metric span {
        display: block;
        color: #a9a08c;
        font-size: 10px;
        font-weight: 800;
      }

      .kc-metric strong {
        display: block;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 17px;
      }

      .kc-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .kc-section-head h3 {
        font-size: 14px;
      }

      .kc-section-head a,
      .kc-primary-link,
      .kc-secondary-link {
        color: #dfb859;
        font-size: 12px;
        font-weight: 900;
      }

      .kc-list {
        display: grid;
        gap: 8px;
      }

      .kc-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 2px solid rgb(255 255 255 / 0.09);
        border-radius: 8px;
        background: rgb(255 255 255 / 0.055);
        padding: 10px;
      }

      .kc-row span,
      .kc-row a {
        min-width: 0;
        display: grid;
        gap: 2px;
      }

      .kc-row strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
      }

      .kc-row small,
      .kc-muted {
        color: #a9a08c;
        font-size: 11px;
      }

      .kc-row b {
        color: #e9d39a;
        font-size: 12px;
        white-space: nowrap;
      }

      .kc-alert,
      .kc-warning,
      .kc-empty {
        border: 2px solid rgb(255 255 255 / 0.1);
        border-radius: 8px;
        padding: 10px;
        font-size: 12px;
        line-height: 1.45;
      }

      .kc-alert {
        border-color: rgb(255 107 107 / 0.35);
        background: rgb(255 107 107 / 0.12);
        color: #ffd2d2;
      }

      .kc-warning {
        border-color: rgb(223 184 89 / 0.35);
        background: rgb(223 184 89 / 0.11);
        color: #ffe7aa;
      }

      .kc-empty {
        border-style: dashed;
        color: #a9a08c;
        text-align: center;
      }

      .kc-add-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
      }

      .kc-add-row input,
      .kc-notes {
        width: 100%;
        border: 2px solid rgb(255 255 255 / 0.1);
        border-radius: 8px;
        background: rgb(0 0 0 / 0.28);
        color: #f8efd8;
        outline: none;
      }

      .kc-add-row input {
        height: 38px;
        padding: 0 10px;
      }

      .kc-add-row button {
        border: 2px solid rgb(223 184 89 / 0.45);
        border-radius: 8px;
        background: rgb(223 184 89 / 0.16);
        color: #ffe7aa;
        cursor: pointer;
        font-size: 12px;
        font-weight: 900;
        padding: 0 10px;
      }

      .kc-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .kc-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        border: 2px solid rgb(255 255 255 / 0.1);
        border-radius: 999px;
        background: rgb(255 255 255 / 0.07);
        padding: 6px 8px 6px 10px;
        font-size: 12px;
        font-weight: 800;
      }

      .kc-chip a {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .kc-chip button {
        border: 0;
        background: transparent;
        color: #ffb4b4;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }

      .kc-dj-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border: 2px solid rgb(223 184 89 / 0.25);
        border-radius: 10px;
        background: linear-gradient(135deg, rgb(38 61 47 / 0.8), rgb(17 24 39 / 0.9));
        padding: 12px;
      }

      .kc-dj-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .kc-primary-button,
      .kc-secondary-button,
      .kc-secondary-link {
        display: inline-flex;
        min-height: 38px;
        align-items: center;
        justify-content: center;
        border: 2px solid rgb(223 184 89 / 0.45);
        border-radius: 8px;
        background: rgb(223 184 89 / 0.15);
        color: #ffe7aa;
        cursor: pointer;
        padding: 8px 10px;
        text-align: center;
      }

      .kc-secondary-button,
      .kc-secondary-link {
        border-color: rgb(255 255 255 / 0.12);
        background: rgb(255 255 255 / 0.06);
        color: #d7d0c2;
      }

      .kc-dj-card p {
        margin: 6px 0 0;
        color: #c9c0ad;
        font-size: 12px;
        line-height: 1.45;
      }

      .kc-dj-frame {
        width: 100%;
        height: 300px;
        border: 2px solid rgb(255 255 255 / 0.12);
        border-radius: 10px;
        background: #0b0f16;
      }

      .kc-label {
        color: #dfb859;
        font-size: 12px;
        font-weight: 900;
      }

      .kc-notes {
        min-height: 220px;
        resize: vertical;
        padding: 10px;
        line-height: 1.5;
      }

      @media (max-width: 640px) {
        .kc-shell {
          left: 12px;
          right: 12px;
          bottom: 12px;
          top: auto;
          width: auto;
        }

        .kc-grid--stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `;

    return style;
  }
})();
