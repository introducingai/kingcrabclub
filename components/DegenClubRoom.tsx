"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Headphones,
  MessageSquare,
  Mic2,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { Badge } from "./ui/badge";

type AvatarTone = "bone" | "purple" | "lime" | "red" | "blue" | "gold";

type ClubGuest = {
  id: string;
  name: string;
  level: number;
  tone: AvatarTone;
  x: number;
  y: number;
  zone: "bar" | "dance" | "stage" | "vip" | "lounge";
};

const baseGuests: ClubGuest[] = [
  { id: "host", name: "000", level: 18, tone: "bone", x: 520, y: 332, zone: "dance" },
  { id: "dj", name: "deckhand", level: 12, tone: "purple", x: 832, y: 214, zone: "stage" },
  { id: "bar", name: "crabhost", level: 9, tone: "blue", x: 244, y: 248, zone: "bar" },
  { id: "vip", name: "baited", level: 16, tone: "gold", x: 572, y: 132, zone: "vip" },
  { id: "chat", name: "alphafi", level: 7, tone: "lime", x: 362, y: 472, zone: "lounge" },
  { id: "queue", name: "runner", level: 14, tone: "red", x: 716, y: 398, zone: "dance" },
];

const arrivingGuests: ClubGuest[] = [
  { id: "arrive-1", name: "fishcake", level: 8, tone: "blue", x: 476, y: 426, zone: "dance" },
  { id: "arrive-2", name: "Nyxen", level: 20, tone: "purple", x: 664, y: 306, zone: "dance" },
  { id: "arrive-3", name: "Book", level: 10, tone: "lime", x: 786, y: 454, zone: "stage" },
  { id: "arrive-4", name: "gates", level: 6, tone: "gold", x: 162, y: 382, zone: "bar" },
  { id: "arrive-5", name: "melly", level: 12, tone: "bone", x: 436, y: 154, zone: "vip" },
  { id: "arrive-6", name: "greenzy", level: 4, tone: "red", x: 300, y: 536, zone: "lounge" },
];

const queue = [
  { user: "deckhand", track: "Crab Market Open", eta: "Live" },
  { user: "alphafi", track: "Beach Alpha Hour", eta: "03:42" },
  { user: "Nyxen", track: "Potion Floor Sweep", eta: "07:18" },
  { user: "runner", track: "Dockside Loop", eta: "11:06" },
];

const chatLines = [
  { user: "crabhost", text: "welcome to the soft launch room" },
  { user: "000", text: "floor feed on left, music on right" },
  { user: "alphafi", text: "if kintara gives auth, avatars mirror from profile" },
  { user: "deckhand", text: "no signatures, just vibes and public room state" },
];

export function DegenClubRoom() {
  const [guests, setGuests] = useState(baseGuests);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const pulseTimer = window.setInterval(() => {
      setPulse((current) => (current + 1) % 4);
    }, 900);

    const arrivalTimer = window.setInterval(() => {
      setGuests((current) => {
        if (current.length >= baseGuests.length + arrivingGuests.length) {
          return current;
        }

        return [...current, arrivingGuests[current.length - baseGuests.length]];
      });
    }, 4200);

    return () => {
      window.clearInterval(pulseTimer);
      window.clearInterval(arrivalTimer);
    };
  }, []);

  const zoneCounts = useMemo(
    () =>
      guests.reduce(
        (counts, guest) => {
          counts[guest.zone] += 1;
          return counts;
        },
        { bar: 0, dance: 0, stage: 0, vip: 0, lounge: 0 },
      ),
    [guests],
  );

  return (
    <div className="space-y-4">
      <section className="kintara-panel rounded-lg p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">King Crab Club</Badge>
              <Badge variant="outline">Degen DJ visual shell</Badge>
              <Badge variant="outline">Mock room presence</Badge>
              <Badge variant="outline">Avatar mirror pending official auth</Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-fuchsia-400/50 bg-fuchsia-500/15 shadow-[0_0_22px_rgb(217_70_239_/_0.35)]">
                <Radio className="h-5 w-5 text-fuchsia-200" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">
                  King Crab Club radio room
                </h1>
                <p className="text-sm text-muted-foreground">
                  In-world club concept for music queueing, alpha chat, and future
                  Kintara avatar mirroring.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SafetyPill icon={ShieldCheck} text="No wallet signatures" />
            <SafetyPill icon={Users} text={`${guests.length} avatars inside`} />
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-md border-2 px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Companion
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border-2 border-[#1f1b2c] bg-[#101018] shadow-[0_22px_80px_rgb(0_0_0_/_0.42)]">
          <div className="flex items-center justify-between border-b-2 border-[#241d36] bg-[#151522] px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">
                Isometric club render
              </p>
              <h2 className="text-lg font-semibold">Degen DJ x Kintara room concept</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-fuchsia-100">
              <Volume2 className="h-3.5 w-3.5" />
              Live shell
            </div>
          </div>
          <div className="relative min-h-[720px] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgb(76_29_149_/_0.28),transparent_36rem),linear-gradient(180deg,#17171f,#08080d)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0,transparent_28rem,rgb(0_0_0_/_0.64)_50rem)]" />
            <ClubStage pulse={pulse} />
            {guests.map((guest) => (
              <RoomAvatar key={guest.id} guest={guest} pulse={pulse} />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <RoomNowPlaying />
          <RoomQueue />
          <RoomPresence zoneCounts={zoneCounts} />
          <MirrorPipeline />
          <RoomChat />
        </aside>
      </section>
    </div>
  );
}

function ClubStage({ pulse }: { pulse: number }) {
  return (
    <div className="absolute left-1/2 top-1/2 h-[580px] w-[980px] -translate-x-1/2 -translate-y-1/2 rotate-[-26deg]">
      <div className="absolute inset-0 border-4 border-[#2e2740] bg-[#252437] shadow-[34px_34px_0_#0c0c12]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255_/_0.045)_1px,transparent_1px),linear-gradient(rgb(0_0_0_/_0.24)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-5 border-2 border-[#38314b]" />
      </div>

      <Wall side="left" />
      <Wall side="top" />
      <Bar />
      <VipLounge />
      <DjBooth pulse={pulse} />
      <DanceFloor pulse={pulse} />
      <Seating />
      <ExitDoor />
      <Restrooms />
      <Planter x={120} y={88} />
      <Planter x={872} y={128} />
      <Planter x={196} y={500} />
      <Planter x={910} y={430} />
      <RopeLine x={118} y={462} />
      <RopeLine x={596} y={116} />
      <RopeLine x={750} y={396} />
    </div>
  );
}

function Wall({ side }: { side: "left" | "top" }) {
  const className =
    side === "left"
      ? "absolute left-0 top-0 h-[580px] w-10 bg-[#181722] shadow-[10px_0_0_#0b0b10]"
      : "absolute left-0 top-0 h-10 w-[980px] bg-[#181722] shadow-[0_10px_0_#0b0b10]";

  return <div className={className} />;
}

function Bar() {
  return (
    <div className="absolute left-[54px] top-[134px] h-[160px] w-[380px] border-2 border-[#16121c] bg-[#1d1a28] shadow-[14px_14px_0_#0a0910]">
      <div className="absolute left-8 top-4 text-[34px] font-black uppercase leading-8 tracking-[0.12em] text-fuchsia-300 [text-shadow:0_0_12px_#e879f9,0_0_28px_#c026d3]">
        King Crab
        <br />
        Club
      </div>
      <div className="absolute left-8 top-[90px] h-3 w-[300px] bg-fuchsia-400 shadow-[0_0_18px_#e879f9]" />
      <div className="absolute left-8 top-[110px] flex gap-2">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-3 rounded-sm border border-black bg-[#8b5e34]"
          />
        ))}
      </div>
      <div className="absolute left-8 top-[144px] h-7 w-[308px] border-2 border-[#151018] bg-[#111019] shadow-[0_0_16px_rgb(217_70_239_/_0.55)]" />
      <div className="absolute left-[338px] top-[78px] rounded-sm border border-red-300 px-1 text-[18px] font-black text-red-300 [text-shadow:0_0_10px_#ef4444]">
        crab
      </div>
    </div>
  );
}

function VipLounge() {
  return (
    <div className="absolute left-[502px] top-[58px] h-[170px] w-[270px] border-2 border-[#1a1323] bg-[#221c32] shadow-[12px_12px_0_#0c0911]">
      <div className="absolute left-6 top-6 h-12 w-44 bg-[#4f254f]" />
      <div className="absolute left-6 top-[76px] h-12 w-44 bg-[#4f254f]" />
      <div className="absolute left-[190px] top-6 h-28 w-14 bg-[#4f254f]" />
      <div className="absolute left-24 top-20 h-12 w-14 border-2 border-[#111018] bg-[#171521]">
        <div className="m-auto mt-3 h-5 w-5 bg-violet-200 shadow-[0_0_18px_#c4b5fd]" />
      </div>
      <div className="absolute left-4 top-3 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
        VIP
      </div>
    </div>
  );
}

function DjBooth({ pulse }: { pulse: number }) {
  return (
    <div className="absolute left-[726px] top-[146px] h-[230px] w-[210px] border-2 border-[#111018] bg-[#171622] shadow-[14px_14px_0_#07070b]">
      <div className="absolute left-4 top-5 h-[190px] w-[170px] border-2 border-[#2c2444] bg-[#101019]">
        <div className="absolute left-4 top-[112px] h-12 w-32 border-2 border-black bg-[#1d2430] shadow-[0_0_16px_rgb(59_130_246_/_0.5)]">
          <div className="absolute left-5 top-3 h-6 w-6 rounded-full border-2 border-cyan-300 bg-[#28243c]" />
          <div className="absolute right-5 top-3 h-6 w-6 rounded-full border-2 border-fuchsia-300 bg-[#28243c]" />
          <div className="absolute left-[58px] top-5 h-1 w-8 bg-emerald-300" />
        </div>
        <LightBeam color="blue" active={pulse % 2 === 0} left={22} top={30} rotate={-24} />
        <LightBeam color="pink" active={pulse % 2 === 1} left={86} top={26} rotate={20} />
        <LightBeam color="blue" active={pulse % 3 === 0} left={126} top={46} rotate={-10} />
        <div className="absolute left-0 top-0 h-full w-3 bg-fuchsia-500 shadow-[0_0_24px_#d946ef]" />
        <div className="absolute right-0 top-0 h-full w-3 bg-blue-400 shadow-[0_0_24px_#60a5fa]" />
      </div>
      <div className="absolute left-4 top-[206px] h-3 w-[172px] bg-fuchsia-500 shadow-[0_0_18px_#d946ef]" />
    </div>
  );
}

function LightBeam({
  color,
  active,
  left,
  top,
  rotate,
}: {
  color: "pink" | "blue";
  active: boolean;
  left: number;
  top: number;
  rotate: number;
}) {
  const colorClass =
    color === "pink"
      ? "from-fuchsia-400/80 to-fuchsia-400/0"
      : "from-blue-400/80 to-blue-400/0";

  return (
    <div
      className={`absolute h-5 w-36 origin-left bg-gradient-to-r ${colorClass} blur-[1px] transition-opacity ${active ? "opacity-90" : "opacity-35"}`}
      style={{ left, top, transform: `rotate(${rotate}deg)` }}
    />
  );
}

function DanceFloor({ pulse }: { pulse: number }) {
  const colors = ["#a78bfa", "#f472b6", "#60a5fa", "#c084fc"];

  return (
    <div className="absolute left-[426px] top-[308px] grid grid-cols-5 gap-1 border-2 border-[#111018] bg-[#111018] p-1 shadow-[0_0_38px_rgb(168_85_247_/_0.42)]">
      {Array.from({ length: 25 }).map((_, index) => {
        const color = colors[(index + pulse) % colors.length];

        return (
          <div
            key={index}
            className="h-11 w-11 transition-colors duration-500"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 ${index % 2 ? 20 : 10}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}

function Seating() {
  const seats = [
    [160, 426],
    [270, 454],
    [386, 490],
  ];

  return (
    <>
      {seats.map(([x, y], index) => (
        <div key={`${x}-${y}`} className="absolute" style={{ left: x, top: y }}>
          <div className="absolute h-12 w-64 border-2 border-[#130f14] bg-[#15131d]" />
          <div className="absolute left-8 top-3 h-7 w-12 bg-[#3b2b25] shadow-[74px_0_0_#3b2b25,148px_0_0_#3b2b25]" />
          <div className="absolute left-[68px] top-14 h-9 w-16 border-2 border-[#130f14] bg-[#1c1b25]">
            <div className="m-auto mt-2 h-4 w-4 bg-fuchsia-200 shadow-[0_0_14px_#f0abfc]" />
          </div>
          <span className="absolute left-2 top-[-16px] text-[10px] font-black uppercase tracking-[0.16em] text-[#756d8c]">
            table {index + 1}
          </span>
        </div>
      ))}
    </>
  );
}

function ExitDoor() {
  return (
    <div className="absolute left-[54px] top-[392px] h-24 w-[54px] border-2 border-[#18131c] bg-[#0d0d12]">
      <div className="absolute left-2 top-2 rounded-sm border border-emerald-300 px-1 text-[10px] font-black text-emerald-300 shadow-[0_0_12px_#34d399]">
        EXIT
      </div>
      <div className="absolute left-8 top-8 h-16 w-12 bg-[#1d1720]" />
    </div>
  );
}

function Restrooms() {
  return (
    <div className="absolute left-[794px] top-[62px] flex gap-3">
      <div className="h-[88px] w-14 border-2 border-[#18131c] bg-[#0d0d12] text-center text-lg font-black leading-[84px] text-blue-300 shadow-[0_0_12px_#60a5fa]">
        M
      </div>
      <div className="h-[88px] w-14 border-2 border-[#18131c] bg-[#0d0d12] text-center text-lg font-black leading-[84px] text-fuchsia-300 shadow-[0_0_12px_#f0abfc]">
        W
      </div>
    </div>
  );
}

function Planter({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="absolute left-0 top-10 h-10 w-10 bg-[#e2ddd1]" />
      <div className="absolute left-2 top-2 h-8 w-8 bg-[#254d25]" />
      <div className="absolute left-8 top-8 h-7 w-7 bg-[#37692e]" />
      <div className="absolute left-[-8px] top-6 h-7 w-7 bg-[#2d632a]" />
    </div>
  );
}

function RopeLine({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="absolute left-0 top-0 h-10 w-2 bg-[#c99a37]" />
      <div className="absolute left-28 top-0 h-10 w-2 bg-[#c99a37]" />
      <div className="absolute left-2 top-5 h-2 w-28 bg-[#7f1d1d]" />
    </div>
  );
}

function RoomAvatar({ guest, pulse }: { guest: ClubGuest; pulse: number }) {
  const body: Record<AvatarTone, string> = {
    bone: "#f2f0e5",
    purple: "#6d3bbd",
    lime: "#9bd934",
    red: "#d84d3d",
    blue: "#2563eb",
    gold: "#d6b64a",
  };
  const hair: Record<AvatarTone, string> = {
    bone: "#f2f0e5",
    purple: "#111111",
    lime: "#ddf34f",
    red: "#171717",
    blue: "#171717",
    gold: "#3b2d18",
  };
  const bob = pulse % 2 === 0 ? 0 : -3;

  return (
    <div
      className="absolute h-[100px] w-[86px] rotate-[-26deg]"
      style={{ left: guest.x, top: guest.y + bob }}
    >
      <div className="absolute left-[8px] top-[-26px] w-56 -translate-x-1/2 text-center text-[12px] font-black leading-3 text-white [text-shadow:0_2px_0_#000,1px_0_0_#000,-1px_0_0_#000]">
        <span className="block text-[10px] text-[#ff5577]">Lvl {guest.level}</span>
        {guest.name}
      </div>
      <div
        className="absolute left-[22px] top-[8px] h-[27px] w-[29px] border-2 border-black"
        style={{ backgroundColor: hair[guest.tone] }}
      />
      <div className="absolute left-[23px] top-[20px] h-[29px] w-[31px] border-2 border-black bg-[#d3ad88]">
        <span className="absolute left-1.5 top-2 h-1.5 w-1.5 bg-black" />
        <span className="absolute right-1.5 top-2 h-1.5 w-1.5 bg-black" />
      </div>
      <div
        className="absolute left-[20px] top-[50px] h-[32px] w-[36px] border-2 border-black"
        style={{ backgroundColor: body[guest.tone] }}
      />
      <div className="absolute left-[16px] top-[79px] h-5 w-4 border-2 border-black bg-[#202631]" />
      <div className="absolute left-[48px] top-[79px] h-5 w-4 border-2 border-black bg-[#202631]" />
      {guest.id === "host" ? (
        <Crown className="absolute left-[42px] top-[1px] h-4 w-4 text-yellow-300" />
      ) : null}
    </div>
  );
}

function SafetyPill({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-100">
      <Icon className="h-4 w-4 text-emerald-300" />
      {text}
    </span>
  );
}

function RoomNowPlaying() {
  return (
    <Panel title="Now playing" icon={Headphones}>
      <div className="rounded-lg border-2 border-fuchsia-400/30 bg-fuchsia-500/10 p-4">
        <p className="text-lg font-semibold">Crab Market Open</p>
        <p className="mt-1 text-sm text-muted-foreground">deckhand on the booth</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 bg-gradient-to-r from-fuchsia-400 to-blue-400 shadow-[0_0_16px_#d946ef]" />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>02:18</span>
          <span>03:42</span>
        </div>
      </div>
    </Panel>
  );
}

function RoomQueue() {
  return (
    <Panel title="DJ queue" icon={Radio}>
      <div className="space-y-2">
        {queue.map((item, index) => (
          <div
            key={item.track}
            className="rounded-lg border-2 bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{item.track}</p>
              <span className="text-xs font-black text-primary">{item.eta}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              #{index + 1} by {item.user}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RoomPresence({
  zoneCounts,
}: {
  zoneCounts: Record<ClubGuest["zone"], number>;
}) {
  return (
    <Panel title="Room presence" icon={Users}>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(zoneCounts).map(([zone, count]) => (
          <div key={zone} className="rounded-lg border-2 bg-muted/20 p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
              {zone}
            </p>
            <p className="mt-1 text-2xl font-semibold">{count}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MirrorPipeline() {
  return (
    <Panel title="Avatar mirror" icon={Sparkles}>
      <div className="rounded-lg border-2 border-amber-400/30 bg-amber-500/10 p-3">
        <p className="text-sm font-semibold text-amber-100">
          Future official integration
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          When Kintara exposes login/profile data, the room can map each session
          user to their display name, level, outfit, and cosmetics. Until then this
          page uses mock avatars only.
        </p>
      </div>
    </Panel>
  );
}

function RoomChat() {
  return (
    <Panel title="Alpha chat" icon={MessageSquare}>
      <div className="space-y-2">
        {chatLines.map((line) => (
          <div key={`${line.user}-${line.text}`} className="rounded-lg bg-muted/20 p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">
              {line.user}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{line.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-10 items-center gap-2 rounded-lg border-2 bg-background/70 px-3 text-sm text-muted-foreground">
        <Mic2 className="h-4 w-4 text-primary" />
        Chat composer disabled in visual MVP
      </div>
    </Panel>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="kintara-panel rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
