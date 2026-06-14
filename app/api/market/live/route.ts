import { NextRequest, NextResponse } from "next/server";
import { normalizeListing } from "@/lib/kintaraApi";
import { recordMarketFailure, recordMarketSnapshot } from "@/lib/marketCache";

export const runtime = "nodejs";

const FRIENDLY_ERROR =
  "Kintara marketplace data is not publicly accessible from this companion yet. This likely needs an official API key, same-origin deployment, or approved integration.";

function baseUrl() {
  return (
    process.env.KINTARA_BASE_URL ??
    process.env.NEXT_PUBLIC_KINTARA_BASE_URL ??
    "https://kintara.gg"
  ).replace(/\/$/, "");
}

function unwrapListings(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["listings", "items", "data", "results"]) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export async function GET(request: NextRequest) {
  const upstream = new URL(`${baseUrl()}/api/marketplace/listings`);

  request.nextUrl.searchParams.forEach((value, key) => {
    if (value !== "") {
      upstream.searchParams.set(key, value);
    }
  });

  if (!upstream.searchParams.has("limit")) {
    upstream.searchParams.set("limit", "150");
  }

  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      const error = `HTTP ${response.status} from ${upstream.pathname}: ${FRIENDLY_ERROR}`;
      const fallback = recordMarketFailure(error);

      console.error("Live market proxy failed", {
        status: response.status,
        source: upstream.toString(),
        bodyPreview: JSON.stringify(payload).slice(0, 240),
      });

      if (fallback) {
        return NextResponse.json(fallback, {
          headers: { "Cache-Control": "no-store" },
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error,
          status: response.status,
          source: upstream.pathname,
        },
        { status: response.status },
      );
    }

    const listings = unwrapListings(payload).map(normalizeListing);

    return NextResponse.json(recordMarketSnapshot(listings), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = `HTTP 502 from ${upstream.pathname}: ${FRIENDLY_ERROR}`;
    const fallback = recordMarketFailure(message);

    console.error("Live market proxy crashed", {
      source: upstream.toString(),
      error: error instanceof Error ? error.message : String(error),
    });

    if (fallback) {
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
        status: 502,
        source: upstream.pathname,
      },
      { status: 502 },
    );
  }
}
