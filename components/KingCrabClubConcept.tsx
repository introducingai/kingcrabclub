"use client";

import Link from "next/link";
import { ExternalLink, Radio, Users, Waves } from "lucide-react";
import { Badge } from "./ui/badge";

export function KingCrabClubConcept() {
  const degenUrl = process.env.NEXT_PUBLIC_DEGEN_DJ_URL || "/degen/";
  const isExternalDegenUrl = /^https?:\/\//.test(degenUrl);
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_MIRROR_URL;

  return (
    <section className="kintara-panel overflow-hidden rounded-lg">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,0.72fr)_minmax(560px,1fr)]">
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Venue concept</Badge>
            <Badge variant="outline">Degen DJ room</Badge>
            <Badge variant="outline">Telegram mirror</Badge>
          </div>

          <div className="mt-7 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-primary">
              King Crab Club
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-5xl">
              A beach-side club pitch that makes the companion feel native to Kintara.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Instead of asking players to trust an extension first, this gives them a
              public social mirror: market pulse, alpha room, and Degen DJ session in a
              venue concept that could later become a real map location.
            </p>
          </div>

          <div className="mt-7 grid gap-3">
            <ConceptPoint
              icon={Radio}
              title="The audio layer"
              text="Degen DJ runs as the club sound system: playlist queue, room energy, and social proof while people play."
            />
            <ConceptPoint
              icon={Waves}
              title="The beach landmark"
              text="Exterior concept uses Kintara-like grass, paths, trees, block avatars, and a readable King Crab Club sign."
            />
            <ConceptPoint
              icon={Users}
              title="The lobby angle"
              text="A visual pitch for an official beach venue, event room, or even a future King Crab themed cosmetic."
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={degenUrl}
              target={isExternalDegenUrl ? "_blank" : undefined}
              rel={isExternalDegenUrl ? "noreferrer" : undefined}
              className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-primary/50 bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Radio className="h-4 w-4" />
              Enter Degen DJ room
            </a>
            {telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border-2 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Telegram mirror
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            <Link
              href="/market"
              className="inline-flex h-10 items-center gap-2 rounded-md border-2 px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Market pulse
            </Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Unofficial read-only community concept. No Kintara inventory actions,
            marketplace writes, wallet signatures, or private account access.
          </p>
        </div>

        <div className="border-t-2 bg-[#080810] p-4 sm:p-6 xl:border-l-2 xl:border-t-0" style={{ borderColor: 'rgba(130,100,220,0.22)' }}>
          <div className="flex flex-col gap-4">
            <SceneFrame title="Exterior map pitch" label="KING CRAB CLUB" height={280}>
              <ExteriorClubScene />
            </SceneFrame>
            <SceneFrame title="Inside the room" label="DEGEN DJ QUEUE" height={320}>
              <InteriorClubScene />
            </SceneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConceptPoint({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border-2 bg-muted/25 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function SceneFrame({
  title,
  label,
  height = 300,
  children,
}: {
  title: string;
  label: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-[#1a1a2e] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.08)]">
      <div className="flex items-center justify-between border-b-2 border-[#1a1a2e] bg-[#0c0c1e] px-3 py-2">
        <span className="text-sm font-black text-[#e8e0ff]">{title}</span>
        <span className="rounded border border-[#9d70ff]/40 bg-[#080810] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#9d70ff]">
          {label}
        </span>
      </div>
      <div className="relative overflow-hidden bg-black" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

function ExteriorClubScene() {
  return (
    <img
      src="/kcc-exterior.png"
      alt="King Crab Club exterior"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}

function InteriorClubScene() {
  return (
    <img
      src="/kcc-interior.png"
      alt="King Crab Club interior"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}
