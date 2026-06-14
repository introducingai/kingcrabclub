import { MessageCircle, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function TelegramMirrorCard() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_MIRROR_URL;
  const degenUrl = process.env.NEXT_PUBLIC_DEGEN_DJ_URL ?? "http://localhost:5173";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Telegram Mirror
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">No install preview</Badge>
          <Badge variant="outline">Read-only feed</Badge>
          <Badge variant="outline">Radio room link</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Watch market pulses and jump into the Degen DJ room from Telegram before
          installing the browser overlay.
        </p>
        <div className="flex flex-wrap gap-2">
          {telegramUrl ? (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md border-2 border-primary/50 bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Open Telegram
            </a>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-md border-2 px-4 text-sm font-semibold text-muted-foreground">
              Add Telegram URL
            </span>
          )}
          <a
            href={degenUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border-2 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            <Radio className="h-4 w-4" />
            Degen DJ
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
