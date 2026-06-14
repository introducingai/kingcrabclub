import { NextRequest, NextResponse } from "next/server";
import {
  formatExtensionInfoForTelegram,
  formatRadioForTelegram,
  formatTelegramHelp,
} from "@/lib/telegram/format";
import { buildMarketPulseMessage } from "@/lib/telegram/server";
import { sendTelegramMessage, telegramWebhookAuthorized } from "@/lib/telegram/client";
import type { TelegramUpdate } from "@/lib/telegram/types";

export const runtime = "nodejs";

function dashboardUrl(origin: string) {
  return process.env.NEXT_PUBLIC_APP_URL ?? origin;
}

function degenUrl() {
  return (
    process.env.TELEGRAM_PUBLIC_ROOM_URL ??
    process.env.NEXT_PUBLIC_DEGEN_DJ_URL ??
    "http://localhost:5173"
  );
}

export async function POST(request: NextRequest) {
  if (!telegramWebhookAuthorized(request.headers)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TelegramUpdate;
  const message = update.message ?? update.channel_post;
  const chatId = message?.chat.id;
  const text = message?.text?.trim() ?? "";

  if (!chatId || !text.startsWith("/")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const command = text.split(/\s+/)[0].replace(/@.+$/, "").toLowerCase();
    const appUrl = dashboardUrl(request.nextUrl.origin);
    let reply: string;

    if (command === "/market") {
      reply = await buildMarketPulseMessage(request.nextUrl.origin);
    } else if (command === "/radio" || command === "/dj") {
      reply = formatRadioForTelegram(degenUrl());
    } else if (command === "/extension") {
      reply = formatExtensionInfoForTelegram(appUrl);
    } else {
      reply = formatTelegramHelp({ dashboardUrl: appUrl, degenUrl: degenUrl() });
    }

    await sendTelegramMessage({
      chatId,
      text: reply,
      disableWebPagePreview: command === "/market",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    await sendTelegramMessage({
      chatId,
      text: "Mirror temporarily unavailable. The companion stays read-only and no game actions were attempted.",
      disableWebPagePreview: true,
    }).catch(() => undefined);

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
    source: "/api/telegram/webhook",
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
}
