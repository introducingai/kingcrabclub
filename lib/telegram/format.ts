import { formatNumber, formatRelativeSeconds } from "../format";
import type { LiveMarketResponse, MarketEvent, MarketListing } from "../types";

function displayItem(value?: string) {
  return (value ?? "Unknown item").replace(/[_-]/g, " ");
}

function price(value?: number, currency?: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  const suffix = currency === "token" ? "KINS" : currency ?? "gold";
  const amount = currency === "token" ? `$${formatNumber(value, 4)}` : formatNumber(value, 4);

  return `${amount} ${suffix}`;
}

function listingLine(listing: MarketListing) {
  return [
    displayItem(listing.itemName),
    `x${formatNumber(listing.quantity)}`,
    price(listing.unitPriceUsd ?? listing.unitPrice, listing.currency),
    listing.seller ? `seller: ${listing.seller}` : undefined,
  ]
    .filter(Boolean)
    .join(" - ");
}

function eventLine(event: MarketEvent) {
  return `- ${event.message}`;
}

export function formatMarketPulseForTelegram(live: LiveMarketResponse) {
  const floors = live.summary.topItemFloors.slice(0, 6);
  const biggest = live.summary.biggestListings.slice(0, 4);
  const events = live.events.slice(0, 5);
  const lines = [
    "Kintara Market Pulse",
    "",
    `Active listings: ${formatNumber(live.summary.activeListings)}`,
    `KINS listings: ${formatNumber(live.summary.tokenListings)}`,
    `Gold listings: ${formatNumber(live.summary.goldListings)}`,
    `Unique item types: ${formatNumber(live.summary.uniqueItemTypes)}`,
    `Updated: ${formatRelativeSeconds(live.generatedAt)}`,
  ];

  if (live.warning) {
    lines.push("", `Warning: ${live.warning}`);
  }

  lines.push("", "Top floors:");
  lines.push(
    ...(floors.length
      ? floors.map((floor) =>
          `- ${displayItem(floor.itemName)}: ${price(floor.floorPrice, floor.currency)}`,
        )
      : ["- No floor data yet."]),
  );

  lines.push("", "Biggest listings:");
  lines.push(...(biggest.length ? biggest.map((listing) => `- ${listingLine(listing)}`) : ["- No listings returned."]));

  lines.push("", "Recent activity:");
  lines.push(...(events.length ? events.map(eventLine) : ["- No recent events."]));

  lines.push("", "Read-only mirror. No wallet prompts. No marketplace writes.");

  return lines.join("\n").slice(0, 3800);
}

export function formatTelegramHelp({
  dashboardUrl,
  degenUrl,
}: {
  dashboardUrl: string;
  degenUrl: string;
}) {
  return [
    "Kintara Companion Mirror",
    "",
    "Commands:",
    "/market - latest read-only market pulse",
    "/radio - Degen DJ room link",
    "/extension - browser overlay info",
    "/help - command list",
    "",
    `Dashboard: ${dashboardUrl}`,
    `Degen DJ: ${degenUrl}`,
    "",
    "Safety: this bot does not buy, sell, reserve, cancel, request wallet signatures, or mutate game inventory.",
  ].join("\n");
}

export function formatRadioForTelegram(degenUrl: string) {
  return [
    "Degen DJ Room",
    "",
    "Open the room, queue music, and hang in alpha chat while playing.",
    degenUrl,
    "",
    "Browser audio may require one click in the room before playback starts.",
  ].join("\n");
}

export function formatExtensionInfoForTelegram(dashboardUrl: string) {
  return [
    "Kintara Companion Overlay",
    "",
    "The extension is optional. This Telegram mirror exists so people can watch the market feed before installing anything.",
    "",
    `Dashboard: ${dashboardUrl}`,
    "",
    "Read-only only: no automation, no wallet signatures, no marketplace writes.",
  ].join("\n");
}
