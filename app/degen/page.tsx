import Link from "next/link";
import { ArrowLeft, Radio, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DegenRoomPage() {
  return (
    <div className="space-y-4">
      <section className="kintara-panel rounded-lg p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">King Crab Club</Badge>
              <Badge variant="outline">Degen DJ room</Badge>
              <Badge variant="outline">Unofficial community mirror</Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-primary/50 bg-primary/15">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">
                  King Crab Club radio room
                </h1>
                <p className="text-sm text-muted-foreground">
                  Degen DJ session embedded inside the companion shell.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border-2 px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to companion
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Read-only shell. No Kintara marketplace writes, wallet signatures, token approvals, or inventory access.
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border-2 bg-card">
        <iframe
          title="Degen DJ King Crab Club room"
          src="/degen/index.html"
          className="h-[calc(100vh-220px)] min-h-[640px] w-full bg-black"
          allow="autoplay; clipboard-write"
        />
      </section>
    </div>
  );
}
