import { NextResponse } from "next/server";

const CACHE_SECONDS = 30;

function baseUrl() {
  return (
    process.env.KINTARA_BASE_URL ??
    process.env.NEXT_PUBLIC_KINTARA_BASE_URL ??
    "https://kintara.gg"
  ).replace(/\/$/, "");
}

// Candidate paths to probe — Kintara's public API path is unknown; try in order
const MERCHANT_PATHS = [
  "/api/traveling-merchant",
  "/api/traveling-merchant/status",
  "/api/merchant",
  "/api/merchant/status",
  "/api/donation-drive",
  "/api/events/traveling-merchant",
];

export async function GET() {
  const base = baseUrl();

  for (const path of MERCHANT_PATHS) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { accept: "application/json" },
        next: { revalidate: CACHE_SECONDS },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) continue;

      const data: unknown = await res.json();

      return NextResponse.json(
        { ok: true, data, source: path },
        {
          headers: {
            "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
          },
        },
      );
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "Traveling Merchant data not yet exposed by Kintara public API. " +
        "Set KINTARA_MERCHANT_URL env var to override, or wire up the correct endpoint once discovered.",
      status: 404,
    },
    { status: 404 },
  );
}
