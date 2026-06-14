import "server-only";

import type { TelegramSendMessageResponse } from "./types";

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

export function telegramConfigured() {
  return Boolean(botToken());
}

export async function sendTelegramMessage({
  chatId,
  text,
  disableWebPagePreview = false,
}: {
  chatId: string | number;
  text: string;
  disableWebPagePreview?: boolean;
}) {
  const token = botToken();

  if (!token) {
    throw new Error("missing_telegram_bot_token");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: disableWebPagePreview,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as TelegramSendMessageResponse;

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.description ?? `telegram_http_${response.status}`);
  }

  return payload;
}

export function telegramWebhookAuthorized(headers: Headers) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  return headers.get("x-telegram-bot-api-secret-token") === secret;
}
