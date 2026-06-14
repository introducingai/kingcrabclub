"use client";

import Link from "next/link";
import { ExternalLink, Radio, Shell, Users, Waves } from "lucide-react";
import { Badge } from "./ui/badge";

type AvatarTone = "white" | "purple" | "green" | "red" | "navy";

const exteriorAvatars = [
  { x: 98, y: 232, name: "host", tone: "white" as const, level: 18 },
  { x: 222, y: 202, name: "dj", tone: "purple" as const, level: 12 },
  { x: 330, y: 236, name: "alpha", tone: "green" as const, level: 7 },
  { x: 412, y: 158, name: "trade", tone: "red" as const, level: 16 },
];

const interiorAvatars = [
  { x: 104, y: 154, name: "mix", tone: "purple" as const, level: 8 },
  { x: 256, y: 126, name: "000", tone: "white" as const, level: 18 },
  { x: 366, y: 170, name: "queue", tone: "navy" as const, level: 13 },
];

const exteriorTrees = [
  { x: 34, y: 32, scale: 0.85 },
  { x: 448, y: 46, scale: 0.92 },
  { x: 58, y: 276, scale: 0.7 },
  { x: 466, y: 258, scale: 0.74 },
];

const rocks = [
  { x: 122, y: 62 },
  { x: 386, y: 88 },
  { x: 442, y: 298 },
  { x: 48, y: 204 },
];

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

        <div className="border-t-2 bg-[#8dd0e6] p-4 sm:p-6 xl:border-l-2 xl:border-t-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <SceneFrame title="Exterior map pitch" label="KING CRAB CLUB">
              <ExteriorClubScene />
            </SceneFrame>
            <SceneFrame title="Inside the room" label="DEGEN DJ QUEUE">
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
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-[#172319] bg-[#75bb56] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.18)]">
      <div className="flex items-center justify-between border-b-2 border-[#172319] bg-[#1b2222] px-3 py-2">
        <span className="text-sm font-black text-[#fff1c4]">{title}</span>
        <span className="rounded border border-[#66562a] bg-[#111719] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f5d16b]">
          {label}
        </span>
      </div>
      <div className="relative h-[390px] overflow-hidden bg-[#72bd58]">
        <TileGrid />
        {children}
      </div>
    </div>
  );
}

function ExteriorClubScene() {
  return (
    <>
      <Water x={350} y={244} />
      <Path />
      <div className="absolute left-[96px] top-[80px]">
        <ClubBuilding />
      </div>
      <Billboard />
      <Dock />
      {exteriorTrees.map((tree) => (
        <Tree key={`${tree.x}-${tree.y}`} {...tree} />
      ))}
      {rocks.map((rock) => (
        <Rock key={`${rock.x}-${rock.y}`} {...rock} />
      ))}
      {exteriorAvatars.map((avatar) => (
        <BlockAvatar key={avatar.name} {...avatar} />
      ))}
      <QuestionNpc x={164} y={236} />
      <CrabMount x={304} y={282} />
      <MiniChatBubble x={220} y={48} text="Tonight: crab radio + market pulse" />
    </>
  );
}

function InteriorClubScene() {
  return (
    <>
      <div className="absolute inset-0 bg-[#445761]" />
      <div className="absolute left-[58px] top-[58px] h-[256px] w-[420px] rotate-[24deg] border-2 border-[#26333a] bg-[#8e9aa7] shadow-[0_22px_0_#6d7782]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255_/_0.16)_1px,transparent_1px),linear-gradient(rgb(0_0_0_/_0.14)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute left-[44px] top-[36px] h-8 w-[250px] border-2 border-[#d9dce0] bg-[#f4f5f2] shadow-[0_9px_0_#b9bec4]" />
        <div className="absolute left-[50px] top-[72px] h-8 w-[238px] border-2 border-[#ccd2d8] bg-[#e7ebec]" />
        <div className="absolute left-[260px] top-[116px] h-10 w-10 border-2 border-[#6a3b23] bg-[#4a2515] shadow-[42px_44px_0_#4a2515]" />
        <div className="absolute left-[72px] top-[174px] h-10 w-10 border-2 border-[#6a3b23] bg-[#4a2515] shadow-[54px_34px_0_#4a2515]" />
        <div className="absolute left-[278px] top-[178px] grid grid-cols-3 gap-2">
          <ArrowTile />
          <ArrowTile />
          <ArrowTile />
        </div>
      </div>
      <div className="absolute left-[80px] top-[42px] rounded border-2 border-black bg-[#20282b] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f5d16b]">
        King Crab Club interior
      </div>
      {interiorAvatars.map((avatar) => (
        <BlockAvatar key={avatar.name} {...avatar} />
      ))}
      <DjDeck x={164} y={118} />
      <MiniChatBubble x={238} y={286} text="Line out - wait for a bite..." />
    </>
  );
}

function TileGrid() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(20_87_31_/_0.22)_1px,transparent_1px),linear-gradient(rgb(20_87_31_/_0.22)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(45deg,rgb(255_255_255_/_0.08)_25%,transparent_25%,transparent_50%,rgb(0_0_0_/_0.05)_50%,rgb(0_0_0_/_0.05)_75%,transparent_75%)] [background-size:32px_32px]" />
    </>
  );
}

function Path() {
  return (
    <>
      <div className="absolute left-[190px] top-[-38px] h-[520px] w-[86px] rotate-[48deg] bg-[#a18b66]" />
      <div className="absolute left-[100px] top-[218px] h-[84px] w-[360px] rotate-[8deg] bg-[#a18b66]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_23px,rgb(86_62_40_/_0.14)_24px),linear-gradient(transparent_0,transparent_23px,rgb(86_62_40_/_0.14)_24px)] bg-[size:24px_24px]" />
    </>
  );
}

function Water({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute h-[190px] w-[250px] rotate-[-19deg] rounded-[30%] border-4 border-[#6cb5d0]/80 bg-[#458ab9]"
      style={{ left: x, top: y }}
    >
      <div className="absolute left-16 top-14 h-2 w-20 rotate-[-12deg] rounded-full bg-[#75b6d4]/60" />
      <div className="absolute left-32 top-28 h-2 w-16 rotate-[16deg] rounded-full bg-[#75b6d4]/60" />
    </div>
  );
}

function ClubBuilding() {
  return (
    <div className="relative h-[180px] w-[310px]">
      <div className="absolute left-[34px] top-[72px] h-[104px] w-[214px] border-2 border-[#5f5238] bg-[#c7b889] shadow-[16px_16px_0_#8d764f]" />
      <div className="absolute left-[72px] top-[34px] h-[72px] w-[244px] skew-x-[-28deg] border-2 border-[#1b1815] bg-[#252520]" />
      <div className="absolute left-[36px] top-[36px] h-[72px] w-[242px] skew-x-[-28deg] border-2 border-[#1b1815] bg-[#323027]" />
      <div className="absolute left-[24px] top-[82px] h-4 w-[224px] bg-[#d8c995]" />
      <div className="absolute left-[92px] top-[111px] h-[62px] w-[58px] border-2 border-[#3b2c20] bg-[#2b2119]" />
      <div className="absolute left-[174px] top-[104px] h-[38px] w-[36px] border-2 border-[#3b2c20] bg-[#99c2c8]" />
      <div className="absolute left-[44px] top-[104px] h-[38px] w-[34px] border-2 border-[#3b2c20] bg-[#99c2c8]" />
      <div className="absolute left-[82px] top-[92px] h-[24px] w-[130px] -skew-x-[18deg] border-2 border-[#17351e] bg-[#244e2a] text-center text-[10px] font-black uppercase leading-5 tracking-[0.12em] text-[#ffe38a]">
        King Crab Club
      </div>
      <div className="absolute left-[86px] top-[154px] h-[12px] w-[82px] border-2 border-[#6e6657] bg-[#a9a5a0]" />
      <div className="absolute left-[66px] top-[98px] h-[76px] w-3 bg-[#efe4bf]" />
      <div className="absolute left-[218px] top-[98px] h-[76px] w-3 bg-[#efe4bf]" />
      <div className="absolute left-[114px] top-[20px] h-8 w-5 bg-[#c2ac60]" />
      <div className="absolute left-[110px] top-[12px] h-4 w-4 rotate-45 bg-[#d3b94f]" />
    </div>
  );
}

function Billboard() {
  return (
    <div className="absolute left-[18px] top-[132px]">
      <div className="absolute left-7 top-20 h-28 w-2 bg-[#333333]" />
      <div className="absolute h-24 w-40 -rotate-[18deg] border-2 border-[#3a3a3a] bg-[#17202a] p-3 text-center shadow-[8px_8px_0_#4c585f]">
        <div className="text-lg font-black tracking-[0.16em] text-[#eabf3d]">
          KINTARA
        </div>
        <div className="mt-2 text-[11px] font-black text-white">KING CRAB</div>
        <div className="text-[11px] font-black text-white">CLUB NIGHT</div>
      </div>
    </div>
  );
}

function Dock() {
  return (
    <>
      <div className="absolute left-[312px] top-[248px] h-20 w-28 rotate-[20deg] border-2 border-[#4b301c] bg-[#724b2b]" />
      <div className="absolute left-[288px] top-[272px] h-3 w-24 rotate-[20deg] bg-[#c08a4a]" />
      <div className="absolute left-[316px] top-[300px] h-3 w-24 rotate-[20deg] bg-[#c08a4a]" />
      <div className="absolute left-[372px] top-[246px] h-16 w-2 bg-[#5d3a1e]" />
      <div className="absolute left-[300px] top-[260px] h-16 w-2 bg-[#5d3a1e]" />
    </>
  );
}

function Tree({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${scale})` }}>
      <div className="absolute left-[34px] top-[74px] h-12 w-6 bg-[#7b3f17]" />
      <div className="absolute left-0 top-[44px] h-12 w-20 bg-[#168930]" />
      <div className="absolute left-[30px] top-[22px] h-12 w-20 bg-[#139334]" />
      <div className="absolute left-[58px] top-[44px] h-12 w-20 bg-[#08752a]" />
    </div>
  );
}

function Rock({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute h-5 w-8 rotate-[-16deg] rounded-sm bg-[#65675d] shadow-[13px_9px_0_#4d5048]"
      style={{ left: x, top: y }}
    />
  );
}

function BlockAvatar({
  x,
  y,
  name,
  tone,
  level,
}: {
  x: number;
  y: number;
  name: string;
  tone: AvatarTone;
  level: number;
}) {
  const bodyColors: Record<AvatarTone, string> = {
    white: "#f2f0e5",
    purple: "#6d3bbd",
    green: "#9bd934",
    red: "#d84d3d",
    navy: "#1f3c6e",
  };
  const hairColors: Record<AvatarTone, string> = {
    white: "#f2f0e5",
    purple: "#111111",
    green: "#d7e42c",
    red: "#151515",
    navy: "#171717",
  };

  return (
    <div className="absolute h-[82px] w-[70px]" style={{ left: x, top: y }}>
      <div className="absolute left-[12px] top-[-14px] w-48 -translate-x-1/2 text-center text-[12px] font-black leading-3 text-white [text-shadow:0_2px_0_#000,1px_0_0_#000,-1px_0_0_#000]">
        <span className="block text-[10px] text-[#ff5577]">Lvl {level}</span>
        {name}
      </div>
      <div
        className="absolute left-[18px] top-[10px] h-[24px] w-[25px] border-2 border-black"
        style={{ backgroundColor: hairColors[tone] }}
      />
      <div className="absolute left-[19px] top-[20px] h-[26px] w-[27px] border-2 border-black bg-[#d5b28e]">
        <span className="absolute left-1 top-2 h-1.5 w-1.5 bg-black" />
        <span className="absolute right-1 top-2 h-1.5 w-1.5 bg-black" />
      </div>
      <div
        className="absolute left-[16px] top-[45px] h-[28px] w-[31px] border-2 border-black"
        style={{ backgroundColor: bodyColors[tone] }}
      />
      <div className="absolute left-[12px] top-[70px] h-4 w-3 border-2 border-black bg-[#202631]" />
      <div className="absolute left-[40px] top-[70px] h-4 w-3 border-2 border-black bg-[#202631]" />
    </div>
  );
}

function QuestionNpc({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="absolute left-6 top-[-18px] text-2xl font-black text-white [text-shadow:0_2px_0_#000,1px_0_0_#000,-1px_0_0_#000]">
        ?
      </div>
      <BlockAvatar x={0} y={0} name="host" tone="navy" level={1} />
    </div>
  );
}

function CrabMount({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="absolute left-4 top-8 h-9 w-16 rounded-full border-2 border-[#3f1e12] bg-[#cf5a34]" />
      <div className="absolute left-0 top-11 h-3 w-14 rotate-[-24deg] rounded-full bg-[#cf5a34]" />
      <div className="absolute left-[48px] top-11 h-3 w-14 rotate-[24deg] rounded-full bg-[#cf5a34]" />
      <div className="absolute left-[62px] top-5 h-6 w-6 rounded-full border-2 border-[#3f1e12] bg-[#f07b3e]" />
      <div className="absolute left-[24px] top-2 h-3 w-3 rounded-full bg-[#1b1510]" />
      <div className="absolute left-[40px] top-2 h-3 w-3 rounded-full bg-[#1b1510]" />
    </div>
  );
}

function MiniChatBubble({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <div
      className="absolute rounded-md border-2 border-black bg-[#4d555b]/92 px-3 py-2 text-center text-xs font-black text-white shadow-[0_3px_0_rgb(0_0_0_/_0.45)]"
      style={{ left: x, top: y }}
    >
      {text}
    </div>
  );
}

function DjDeck({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="absolute h-14 w-24 rotate-[24deg] border-2 border-black bg-[#22262b]" />
      <div className="absolute left-4 top-4 h-6 w-6 rounded-full border-2 border-[#79d6ff] bg-[#8a43ff]" />
      <div className="absolute left-14 top-5 h-2 w-8 bg-[#f5d16b]" />
      <Shell className="absolute left-[78px] top-[4px] h-5 w-5 rotate-[24deg] text-[#f5d16b]" />
    </div>
  );
}

function ArrowTile() {
  return (
    <div className="relative h-8 w-8 bg-[#7d8793]">
      <div className="absolute left-2 top-2 h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#59636e]" />
    </div>
  );
}
