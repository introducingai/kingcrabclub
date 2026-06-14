/* global chrome */
(() => {
  "use strict";

  const defaults = {
    companionBaseUrl: "http://localhost:3000",
    degenDjUrl: "http://localhost:5173",
    dockPosition: "left",
  };
  const form = document.getElementById("settings-form");
  const companionInput = document.getElementById("companion-base-url");
  const degenInput = document.getElementById("degen-dj-url");
  const dockPositionInput = document.getElementById("dock-position");
  const status = document.getElementById("status");
  const openDashboard = document.getElementById("open-dashboard");

  chrome.storage.local.get(Object.keys(defaults), (stored) => {
    const settings = { ...defaults, ...stored };

    companionInput.value = settings.companionBaseUrl;
    degenInput.value = settings.degenDjUrl;
    dockPositionInput.value = settings.dockPosition;
    openDashboard.href = `${trimSlash(settings.companionBaseUrl)}/market`;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const settings = {
      companionBaseUrl: companionInput.value.trim() || defaults.companionBaseUrl,
      degenDjUrl: degenInput.value.trim() || defaults.degenDjUrl,
      dockPosition: dockPositionInput.value || defaults.dockPosition,
    };

    chrome.storage.local.set(settings, () => {
      openDashboard.href = `${trimSlash(settings.companionBaseUrl)}/market`;
      status.textContent = "Saved. Refresh any open Kintara tab to re-read extension settings.";
    });
  });

  function trimSlash(value) {
    return String(value || "").replace(/\/$/, "");
  }
})();
