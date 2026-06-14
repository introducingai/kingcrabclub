import { AlertTriangle, SearchX } from "lucide-react";
import { Card, CardContent } from "./ui/card";

type EmptyStateProps = {
  title: string;
  message?: string;
  tone?: "empty" | "error";
};

export function EmptyState({ title, message, tone = "empty" }: EmptyStateProps) {
  const Icon = tone === "error" ? AlertTriangle : SearchX;

  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 bg-muted text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {message ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
