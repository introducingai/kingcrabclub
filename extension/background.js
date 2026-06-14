/* global chrome */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) {
    return false;
  }

  if (message.type === "KC_OPEN_DEGEN_SESSION") {
    const source = encodeURIComponent(message.degenDjUrl || "http://localhost:5173");
    chrome.tabs.create({
      url: chrome.runtime.getURL(`degen-session.html?src=${source}`),
      active: true,
    });
    sendResponse({ ok: true });
    return false;
  }

  if (message.type !== "KC_FETCH_LIVE_MARKET") {
    return false;
  }

  fetchLiveMarket(message.baseUrl)
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });

  return true;
});

async function fetchLiveMarket(baseUrl) {
  const safeBaseUrl = String(baseUrl || "http://localhost:3000").replace(/\/$/, "");
  const response = await fetch(
    `${safeBaseUrl}/api/market/live?sort=latest&limit=100&offset=0`,
    { cache: "no-store" },
  );
  const payload = await response.json();

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload;
}
