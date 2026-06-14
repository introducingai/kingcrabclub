/* global chrome */
(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const fallback = "http://localhost:5173";
  const frame = document.getElementById("degen-frame");
  const sourceLink = document.getElementById("open-source");
  const focusButton = document.getElementById("focus-room");

  chrome.storage.local.get(["degenDjUrl"], (stored) => {
    const source = params.get("src") || stored.degenDjUrl || fallback;

    frame.src = source;
    sourceLink.href = source;
  });

  focusButton.addEventListener("click", () => {
    frame.focus();
  });
})();
