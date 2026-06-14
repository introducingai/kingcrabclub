import { NextRequest, NextResponse } from "next/server";

const CACHE_SECONDS = 15;
const FRIENDLY_ERROR =
  "Kintara marketplace data is not publicly accessible from this companion yet. This likely needs an official API key, same-origin deployment, or approved integration.";

function baseUrl() {
  return (
    process.env.KINTARA_BASE_URL ??
    process.env.NEXT_PUBLIC_KINTARA_BASE_URL ??
    "https://kintara.gg"
  ).replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const upstream = new URL(`${baseUrl()}/api/marketplace/listings`);

  request.nextUrl.searchParams.forEach((value, key) => {
    if (value !== "") {
      upstream.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(upstream, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: CACHE_SECONDS },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      console.error("Kintara listings proxy failed", {
        status: response.status,
        source: upstream.toString(),
        bodyPreview:
          typeof payload === "string" ? payload.slice(0, 240) : JSON.stringify(payload).slice(0, 240),
      });
    }

    return NextResponse.json({
      ok: response.ok,
      data: response.ok ? payload : undefined,
      error: response.ok ? undefined : FRIENDLY_ERROR,
      status: response.status,
      source: upstream.pathname,
    }, {
      status: response.ok ? 200 : response.status,
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
      },
    });
  } catch (error) {
    console.error("Kintara listings proxy crashed", {
      source: upstream.toString(),
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        error: FRIENDLY_ERROR,
        status: 502,
        source: upstream.pathname,
      },
      { status: 502 },
    );
  }
}
