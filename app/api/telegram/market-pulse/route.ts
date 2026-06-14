import { NextRequest, NextResponse } from "next/server";
import { buildMarketPulseMessage } from "@/lib/telegram/server";
import { sendTelegramMessage } from "@/lib/telegram/client";

export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const secret = process.env.TELEGRAM_ADMIN_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("x-telegram-admin-secret") === secret;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const chatId = process.env.TELEGRAM_DEFAULT_CHAT_ID;

  if (!chatId) {
    return NextResponse.json(
      { ok: false, error: "missing_telegram_default_chat_id" },
      { status: 400 },
    );
  }

  try {
    const text = await buildMarketPulseMessage(request.nextUrl.origin);
    const telegram = await sendTelegramMessage({
      chatId,
      text,
      disableWebPagePreview: true,
    });

    return NextResponse.json({
      ok: true,
      sent: telegram.ok,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Telegram market pulse failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    source: "/api/telegram/market-pulse",
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_DEFAULT_CHAT_ID),
  });
}
