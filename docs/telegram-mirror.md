# Telegram Mirror

The Telegram mirror is a zero-install trust surface for the Kintara Companion.
It lets people see the read-only market feed and Degen DJ room before installing
the browser extension.

## Safety model

- No Kintara marketplace write calls.
- No wallet prompts, signatures, approvals, or private keys.
- No game automation.
- Bot commands read from the companion API only.

## Environment

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_SECRET=
TELEGRAM_DEFAULT_CHAT_ID=
TELEGRAM_PUBLIC_ROOM_URL=
NEXT_PUBLIC_TELEGRAM_MIRROR_URL=
NEXT_PUBLIC_DEGEN_DJ_URL=http://localhost:5173
```

## Routes

- `POST /api/telegram/webhook`
  - Handles Telegram bot commands.
  - If `TELEGRAM_WEBHOOK_SECRET` is set, Telegram must send it as
    `X-Telegram-Bot-Api-Secret-Token`.

- `POST /api/telegram/market-pulse`
  - Sends a market pulse to `TELEGRAM_DEFAULT_CHAT_ID`.
  - Requires header `x-telegram-admin-secret: <TELEGRAM_ADMIN_SECRET>`.

## Bot commands

- `/market` - latest read-only market pulse.
- `/radio` or `/dj` - Degen DJ room link.
- `/extension` - overlay/dash info.
- `/help` - command list and safety copy.

## Webhook setup

After deployment, call Telegram's `setWebhook` endpoint with:

- URL: `https://your-domain.com/api/telegram/webhook`
- Secret token: value of `TELEGRAM_WEBHOOK_SECRET`

Keep the bot token server-side only.

## Launch path

1. Create a public Telegram channel or group.
2. Add the bot.
3. Configure the webhook.
4. Pin a safety message explaining the mirror is read-only.
5. Run periodic `/api/telegram/market-pulse` calls from a scheduler later.

Until a scheduler is added, the pulse route can be triggered manually or by any
external cron provider that sends the admin secret header.
