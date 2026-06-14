"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { fetchListings } from "@/lib/kintaraApi";
import { fetchDexScreenerKinsPairs } from "@/lib/tokenApi";
import { formatCompact, formatNumber, formatUsd } from "@/lib/format";
import type { MarketListing, TokenStats } from "@/lib/types";

type Outfit = "purple" | "red" | "blue" | "green" | "gold";

type ClubPlayer = {
  id: string;
  name: string;
  level: number;
  outfit: Outfit;
  x: number;
  y: number;
  host?: boolean;
  delay: number;
};

type QueueTrack = {
  id: string;
  dj: ClubPlayer;
  track: string;
  source: "YouTube" | "SoundCloud";
  current?: boolean;
};

const players: ClubPlayer[] = [
  { id: "host", name: "000", level: 18, outfit: "gold", x: 500, y: 422, host: true, delay: 0 },
  { id: "nyxen", name: "Nyxen", level: 20, outfit: "purple", x: 606, y: 378, delay: 0.2 },
  { id: "fish", name: "Fishcake", level: 8, outfit: "blue", x: 408, y: 404, delay: 0.35 },
  { id: "runner", name: "runner", level: 14, outfit: "red", x: 650, y: 490, delay: 0.5 },
  { id: "melly", name: "Melly", level: 12, outfit: "green", x: 438, y: 318, delay: 0.65 },
  { id: "book", name: "Book", level: 10, outfit: "blue", x: 728, y: 414, delay: 0.8 },
  { id: "alpha", name: "alphafi", level: 7, outfit: "purple", x: 330, y: 504, delay: 0.95 },
];

const queue: QueueTrack[] = [
  { id: "q1", dj: players[0], track: "Crab Market Open", source: "YouTube", current: true },
  { id: "q2", dj: players[2], track: "Beach Alpha Hour", source: "SoundCloud" },
  { id: "q3", dj: players[1], track: "Potion Floor Sweep", source: "YouTube" },
  { id: "q4", dj: players[5], track: "Dockside Loop", source: "SoundCloud" },
];

const navItems = [
  { href: "/degen", label: "Club" },
  { href: "/market", label: "Market" },
  { href: "/market/wood", label: "Stats" },
  { href: "/account", label: "Account" },
];

const itemGlyphs = ["wood", "ore", "pot", "fish"];

function isoDiamond(cx: number, cy: number, width: number, height: number) {
  return `${cx},${cy - height / 2} ${cx + width / 2},${cy} ${cx},${cy + height / 2} ${cx - width / 2},${cy}`;
}

export function DegenClubRoom() {
  const listingsQuery = useQuery({
    queryKey: ["king-crab-market-pulse"],
    queryFn: () => fetchListings({ limit: 4, sort: "latest" }),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 30000 : 10000,
    placeholderData: (previous) => previous,
  });
  const tokenQuery = useQuery({
    queryKey: ["king-crab-kins"],
    queryFn: fetchDexScreenerKinsPairs,
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 60000 : 30000,
    placeholderData: (previous) => previous,
  });
  const listings = listingsQuery.data?.listings.slice(0, 4) ?? [];
  const onlineCount = players.length + 1;
  const currentTrack = queue.find((track) => track.current) ?? queue[0];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0a0a12] text-[#f8f3ff] [font-family:'Space_Grotesk','Space Grotesk',Inter,ui-sans-serif,system-ui,sans-serif]">
      <style jsx global>{`
        @keyframes kc-pulse-dot {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.88);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes kc-wave {
          0%,
          100% {
            height: 7px;
          }
          50% {
            height: 26px;
          }
        }

        @keyframes kc-bars {
          0%,
          100% {
            height: 4px;
          }
          50% {
            height: 18px;
          }
        }

        @keyframes kc-avatar-bob {
          0%,
          100% {
            transform: translateY(2px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .kc-mono {
          font-family: "Space Mono", "Space_Mono", ui-monospace, SFMono-Regular,
            Menlo, Monaco, Consolas, monospace;
        }

        .kc-svg-neon {
          text-shadow:
            0 0 8px #ff4da6,
            0 0 18px rgba(255, 77, 166, 0.72);
        }

        .kc-avatar-bob {
          animation: kc-avatar-bob 1.9s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>

      <header className="flex h-[52px] items-center justify-between border-b border-[rgba(130,100,220,0.2)] bg-[#0a0a12] px-5">
        <Link href="/degen" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[#141428] text-xl transition-transform group-hover:-translate-y-1">
            🦀
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-[0.12em] text-white">
              King Crab Club
            </h1>
            <p className="kc-mono text-[10px] uppercase tracking-[0.18em] text-[#00e5c8]">
              Kintara World · Est. 2026
            </p>
          </div>
        </Link>

        <nav className="hidden items-center border border-[rgba(130,100,220,0.2)] bg-[#0f0f1e] p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="kc-mono px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#b8afd9] transition-colors hover:bg-[rgba(157,112,255,0.14)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="kc-mono flex items-center gap-2 border border-[rgba(0,229,200,0.35)] bg-[#0f0f1e] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#00e5c8]">
          <span className="h-2.5 w-2.5 bg-[#00e5c8] [animation:kc-pulse-dot_1.2s_ease-in-out_infinite]" />
          {onlineCount} online
        </div>
      </header>

      <main className="grid h-[calc(100vh-52px)] grid-cols-1 gap-4 overflow-hidden p-4 pb-[64px] lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="relative min-h-[560px] overflow-hidden border border-[rgba(130,100,220,0.2)] bg-[#0a0a1a]">
          <ClubSceneSvg />

          <section className="absolute bottom-4 left-4 right-4 grid gap-3 lg:grid-cols-2">
            <TurntableQueue />
            <MarketPulse
              listings={listings}
              isLoading={listingsQuery.isLoading}
              error={listingsQuery.isError ? listingsQuery.error : null}
            />
          </section>
        </section>

        <aside className="grid min-h-0 gap-4 overflow-y-auto lg:block lg:space-y-4">
          <LoginCard />
          <KinsTokenWidget
            stats={tokenQuery.data}
            isLoading={tokenQuery.isLoading}
            error={tokenQuery.isError ? tokenQuery.error : null}
          />
          <ClubNowList />
        </aside>
      </main>

      <NowPlayingBar track={currentTrack} />
    </div>
  );
}

function ClubSceneSvg() {
  const floorTiles = Array.from({ length: 12 }).flatMap((_, row) =>
    Array.from({ length: 13 }).map((__, col) => {
      const cx = 500 + (col - row) * 38;
      const cy = 178 + (col + row) * 20;
      return { id: `${row}-${col}`, row, col, cx, cy };
    }),
  );
  const danceTiles = Array.from({ length: 4 }).flatMap((_, row) =>
    Array.from({ length: 4 }).map((__, col) => {
      const cx = 455 + (col - row) * 42;
      const cy = 370 + (col + row) * 22;
      return { id: `dance-${row}-${col}`, row, col, cx, cy };
    }),
  );

  return (
    <svg
      aria-label="King Crab Club isometric nightclub interior"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1000" height="700" fill="#0a0a1a" />

      <polygon points="70,82 500,24 500,168 70,250" fill="#0d0d24" />
      <polygon points="500,24 930,82 930,250 500,168" fill="#0e0e28" />
      <line x1="104" y1="196" x2="470" y2="147" stroke="#7040d0" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="530" y1="147" x2="892" y2="196" stroke="#0090a0" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="92" y1="239" x2="492" y2="166" stroke="rgba(157,112,255,0.3)" strokeWidth="2" />
      <line x1="508" y1="166" x2="912" y2="239" stroke="rgba(0,229,200,0.2)" strokeWidth="2" />

      <polygon points="70,250 500,168 930,250 500,662" fill="#0a0a1a" />
      {floorTiles.map((tile) => (
        <polygon
          key={tile.id}
          points={isoDiamond(tile.cx, tile.cy, 76, 40)}
          fill={(tile.row + tile.col) % 2 === 0 ? "#10102a" : "#131330"}
          stroke="#1e1848"
          strokeWidth="1"
        />
      ))}

      <NeonWallSign />
      <BarSvg />
      <VipSvg />
      <DjBoothSvg />
      <RestroomSigns />
      <LoungeTables />

      <g>
        {danceTiles.map((tile) => (
          <g key={tile.id}>
            <polygon
              points={isoDiamond(tile.cx, tile.cy, 82, 44)}
              fill={(tile.row + tile.col) % 2 === 0 ? "#201878" : "#201070"}
              opacity="0.28"
            />
            <polygon
              points={isoDiamond(tile.cx, tile.cy, 74, 36)}
              fill={(tile.row + tile.col) % 2 === 0 ? "#201878" : "#201070"}
              stroke="#3d2fe0"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>

      {players.map((player) => (
        <SceneAvatarSvg key={player.id} player={player} />
      ))}

      <a href="/account">
        <g transform="translate(282 384)">
          <g className="kc-avatar-bob" style={{ animationDelay: "1.1s" }}>
            <rect x="-16" y="-31" width="32" height="44" fill="rgba(157,112,255,0.08)" stroke="#b48cff" strokeDasharray="4 3" />
            <rect x="-6" y="-23" width="12" height="10" fill="none" stroke="#b48cff" strokeDasharray="4 3" />
            <rect x="-6" y="-12" width="12" height="16" fill="none" stroke="#b48cff" strokeDasharray="4 3" />
          </g>
          <text x="0" y="34" textAnchor="middle" fill="#b8afd9" fontFamily="Space Mono, monospace" fontSize="11">
            +you?
          </text>
        </g>
      </a>
    </svg>
  );
}

function NeonWallSign() {
  return (
    <g transform="translate(125 104)">
      <rect x="35" y="8" width="184" height="24" fill="#ff4da6" opacity="0.16" />
      <circle cx="18" cy="20" r="15" fill="#ff4da6" opacity="0.18" />
      <circle cx="18" cy="20" r="11" fill="none" stroke="#ff4da6" strokeWidth="2" />
      <rect x="10" y="18" width="16" height="4" fill="#ff4da6" />
      <rect x="6" y="15" width="5" height="3" fill="#ff4da6" />
      <rect x="25" y="15" width="5" height="3" fill="#ff4da6" />
      <text
        x="42"
        y="24"
        className="kc-svg-neon"
        fill="#ff4da6"
        fontFamily="Space Mono, monospace"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
      >
        KING CRAB CLUB
      </text>
      <text x="43" y="44" fill="#00e5c8" fontFamily="Space Mono, monospace" fontSize="8" letterSpacing="1.8">
        LIVE SESSION · KINTARA WORLD
      </text>
    </g>
  );
}

function BarSvg() {
  const bottles = Array.from({ length: 18 }).map((_, index) => ({
    x: 142 + index * 11,
    h: 12 + (index % 4) * 4,
  }));

  return (
    <g>
      <polygon points="120,210 352,178 398,204 166,242" fill="#0c0c22" stroke="#2b206b" strokeWidth="2" />
      <polygon points="128,205 352,174 392,195 168,232" fill="#4a30c0" opacity="0.82" />
      <polygon points="166,242 398,204 398,225 166,266" fill="#080818" stroke="#1d1749" />
      <line x1="136" y1="168" x2="342" y2="139" stroke="#7040d0" strokeWidth="2" opacity="0.7" />
      {bottles.map((bottle) => (
        <rect
          key={bottle.x}
          x={bottle.x}
          y={166 - bottle.h}
          width="5"
          height={bottle.h}
          fill="#17172f"
          stroke="#32265a"
        />
      ))}
      {[190, 238, 286, 334].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="286" rx="13" ry="6" fill="#090914" stroke="#2b206b" />
          <rect x={x - 2} y="256" width="4" height="28" fill="#121226" />
        </g>
      ))}
      <AvatarSprite x={260} y={202} outfit="blue" label="bar" />
    </g>
  );
}

function DjBoothSvg() {
  return (
    <g>
      <polygon points="650,177 833,211 792,296 610,258" fill="#18183a" stroke="#4a30c0" strokeWidth="2" />
      <polygon points="610,258 792,296 792,318 610,280" fill="#101026" stroke="#1e1848" />
      <polygon points="650,177 610,258 610,280 650,198" fill="#0d0d24" stroke="#1e1848" />
      <ellipse cx="682" cy="230" rx="27" ry="16" fill="#080814" stroke="#9d70ff" strokeWidth="2" />
      <ellipse cx="682" cy="230" rx="12" ry="7" fill="#17172f" />
      <circle cx="682" cy="230" r="4" fill="#9d70ff" />
      <ellipse cx="756" cy="244" rx="27" ry="16" fill="#080814" stroke="#00e5c8" strokeWidth="2" />
      <ellipse cx="756" cy="244" rx="12" ry="7" fill="#17172f" />
      <circle cx="756" cy="244" r="4" fill="#00e5c8" />
      <rect x="712" y="229" width="26" height="31" fill="#0c0c22" stroke="#514299" />
      <rect x="718" y="234" width="3" height="20" fill="#ff4da6" />
      <rect x="725" y="234" width="3" height="20" fill="#00e5c8" />
      <rect x="732" y="234" width="3" height="20" fill="#9d70ff" />
      <rect x="696" y="193" width="80" height="27" fill="#080814" stroke="#00e5c8" />
      <polyline points="702,211 712,205 722,214 732,198 742,213 752,207 764,210 772,201" fill="none" stroke="#00e5c8" strokeWidth="2" />
      <SpeakerSvg x={596} y={200} />
      <SpeakerSvg x={820} y={234} />
      <AvatarSprite x={724} y={190} outfit="gold" label="dj" crown />
    </g>
  );
}

function SpeakerSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="28" height="66" fill="#070713" stroke="#32265a" />
      <ellipse cx="14" cy="20" rx="9" ry="11" fill="#11112a" stroke="#9d70ff" />
      <ellipse cx="14" cy="48" rx="10" ry="13" fill="#11112a" stroke="#00e5c8" opacity="0.85" />
    </g>
  );
}

function VipSvg() {
  return (
    <g>
      <polygon points="430,152 572,126 640,157 492,190" fill="#18183a" stroke="#2c2460" />
      <polygon points="492,190 640,157 640,179 492,212" fill="#101026" />
      <text x="492" y="145" fill="#9d70ff" fontFamily="Space Mono, monospace" fontSize="12" fontWeight="700" letterSpacing="2">
        VIP
      </text>
      <line x1="522" y1="141" x2="615" y2="124" stroke="#9d70ff" opacity="0.6" />
      <rect x="475" y="151" width="72" height="18" fill="#28184c" />
      <rect x="548" y="142" width="58" height="18" fill="#28184c" />
      <rect x="430" y="196" width="5" height="20" fill="#f5c842" />
      <rect x="498" y="208" width="5" height="20" fill="#f5c842" />
      <line x1="435" y1="204" x2="498" y2="218" stroke="#f5c842" opacity="0.65" />
      <rect x="604" y="184" width="5" height="20" fill="#f5c842" />
      <rect x="660" y="194" width="5" height="20" fill="#f5c842" />
      <line x1="609" y1="192" x2="660" y2="204" stroke="#f5c842" opacity="0.65" />
    </g>
  );
}

function RestroomSigns() {
  return (
    <g>
      <rect x="816" y="118" width="34" height="58" fill="#090914" stroke="#2f285c" />
      <rect x="858" y="123" width="34" height="58" fill="#090914" stroke="#2f285c" />
      <text x="833" y="153" textAnchor="middle" fill="#60a5fa" fontFamily="Space Mono, monospace" fontSize="18">
        ♂
      </text>
      <text x="875" y="158" textAnchor="middle" fill="#ff4da6" fontFamily="Space Mono, monospace" fontSize="18">
        ♀
      </text>
    </g>
  );
}

function LoungeTables() {
  const tables = [
    { x: 228, y: 514 },
    { x: 338, y: 548 },
    { x: 452, y: 584 },
    { x: 572, y: 616 },
  ];

  return (
    <g>
      <line x1="176" y1="548" x2="476" y2="640" stroke="#8b0000" strokeWidth="3" opacity="0.8" />
      <line x1="208" y1="504" x2="616" y2="626" stroke="#8b0000" strokeWidth="2" opacity="0.5" />
      {tables.map((table) => (
        <g key={`${table.x}-${table.y}`}>
          <polygon points={isoDiamond(table.x, table.y, 64, 34)} fill="#17172f" stroke="#2a2450" />
          <polygon points={isoDiamond(table.x, table.y - 6, 48, 24)} fill="#252541" />
          <circle cx={table.x} cy={table.y - 7} r="6" fill="#9d70ff" opacity="0.4" />
        </g>
      ))}
    </g>
  );
}

function SceneAvatarSvg({ player }: { player: ClubPlayer }) {
  return (
    <g transform={`translate(${player.x} ${player.y})`}>
      <text x="0" y="-48" textAnchor="middle" fill="#ff4da6" fontFamily="Space Mono, monospace" fontSize="9" fontWeight="700">
        Lvl {player.level}
      </text>
      <text x="0" y="-36" textAnchor="middle" fill="#ffffff" fontFamily="Space Mono, monospace" fontSize="11" fontWeight="700">
        {player.name}
      </text>
      <g className="kc-avatar-bob" style={{ animationDelay: `${player.delay}s` }}>
        <AvatarSprite x={0} y={0} outfit={player.outfit} crown={player.host} />
      </g>
    </g>
  );
}

function AvatarSprite({
  x,
  y,
  outfit,
  crown,
}: {
  x: number;
  y: number;
  outfit: Outfit;
  label?: string;
  crown?: boolean;
}) {
  const colors: Record<Outfit, { body: string; hood: string; pants: string; skin: string }> = {
    purple: { body: "#6b3bd1", hood: "#17111f", pants: "#11111e", skin: "#d7b18e" },
    red: { body: "#c94141", hood: "#1b1111", pants: "#17121d", skin: "#d7b18e" },
    blue: { body: "#2b68d8", hood: "#101827", pants: "#121827", skin: "#d7b18e" },
    green: { body: "#37a36b", hood: "#202616", pants: "#13191d", skin: "#d7b18e" },
    gold: { body: "#f5c842", hood: "#3d2c0b", pants: "#181412", skin: "#d7b18e" },
  };
  const c = colors[outfit];

  return (
    <g transform={`translate(${x - 16} ${y - 40})`}>
      {crown ? <polygon points="8,2 13,8 16,2 19,8 24,2 24,10 8,10" fill="#f5c842" /> : null}
      <rect x="10" y="10" width="12" height="8" fill={c.hood} stroke="#05050a" />
      <rect x="10" y="18" width="12" height="10" fill={c.skin} stroke="#05050a" />
      <rect x="7" y="29" width="4" height="10" fill={c.body} stroke="#05050a" />
      <rect x="21" y="29" width="4" height="10" fill={c.body} stroke="#05050a" />
      <rect x="10" y="28" width="12" height="16" fill={c.body} stroke="#05050a" />
      <rect x="10" y="43" width="4" height="8" fill={c.pants} stroke="#05050a" />
      <rect x="18" y="43" width="4" height="8" fill={c.pants} stroke="#05050a" />
    </g>
  );
}

function TurntableQueue() {
  return (
    <div className="border border-[rgba(130,100,220,0.2)] bg-[rgba(8,8,20,0.92)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">Turntable Queue</h2>
        <span className="kc-mono text-[10px] uppercase tracking-[0.16em] text-[#00e5c8]">
          room state
        </span>
      </div>
      <div className="space-y-2">
        {queue.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[#141428] p-2 transition-colors hover:bg-[rgba(157,112,255,0.14)]"
          >
            <MiniAvatar outfit={track.dj.outfit} host={track.dj.host} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{track.track}</p>
              <p className="kc-mono text-[10px] uppercase tracking-[0.12em] text-[#9e94c6]">
                {track.dj.name} · {track.source}
              </p>
            </div>
            {track.current ? <PlayingBars /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniAvatar({ outfit, host }: { outfit: Outfit; host?: boolean }) {
  const colors: Record<Outfit, string> = {
    purple: "#6b3bd1",
    red: "#c94141",
    blue: "#2b68d8",
    green: "#37a36b",
    gold: "#f5c842",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 32 44" className="h-11 w-8 shrink-0">
      {host ? <polygon points="8,2 13,8 16,2 19,8 24,2 24,10 8,10" fill="#f5c842" /> : null}
      <rect x="9" y="8" width="15" height="8" fill="#111" stroke="#05050a" />
      <rect x="8" y="15" width="17" height="14" fill="#d7b18e" stroke="#05050a" />
      <rect x="6" y="28" width="22" height="12" fill={colors[outfit]} stroke="#05050a" />
      <rect x="5" y="39" width="8" height="5" fill="#15151f" stroke="#05050a" />
      <rect x="20" y="39" width="8" height="5" fill="#15151f" stroke="#05050a" />
    </svg>
  );
}

function MarketPulse({
  listings,
  isLoading,
  error,
}: {
  listings: MarketListing[];
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <div className="border border-[rgba(130,100,220,0.2)] bg-[rgba(8,8,20,0.92)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">Market Pulse</h2>
        <span className="kc-mono text-[10px] uppercase tracking-[0.16em] text-[#f5c842]">
          latest
        </span>
      </div>
      <div className="space-y-2">
        {error ? (
          <p className="kc-mono border border-red-400/35 bg-red-950/20 p-3 text-xs text-red-200">
            market feed unavailable
          </p>
        ) : isLoading ? (
          <p className="kc-mono border border-[rgba(130,100,220,0.2)] bg-[#141428] p-3 text-xs text-[#9e94c6]">
            loading listings...
          </p>
        ) : listings.length > 0 ? (
          listings.map((listing, index) => (
            <MarketPulseItem key={listing.id} listing={listing} index={index} />
          ))
        ) : (
          <p className="kc-mono border border-[rgba(130,100,220,0.2)] bg-[#141428] p-3 text-xs text-[#9e94c6]">
            no listings returned
          </p>
        )}
      </div>
    </div>
  );
}

function MarketPulseItem({
  listing,
  index,
}: {
  listing: MarketListing;
  index: number;
}) {
  const isToken = listing.currency === "token";

  return (
    <Link
      href={`/market/${encodeURIComponent(listing.itemType)}`}
      className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[#141428] p-2 transition-colors hover:bg-[rgba(157,112,255,0.14)]"
    >
      <ItemIcon kind={itemGlyphs[index % itemGlyphs.length]} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{listing.itemName}</p>
        <p className="kc-mono text-[10px] uppercase tracking-[0.12em] text-[#9e94c6]">
          x{formatNumber(listing.quantity)}
        </p>
      </div>
      <span
        className={`kc-mono text-xs font-bold ${isToken ? "text-[#00e5c8]" : "text-[#f5c842]"}`}
      >
        {isToken ? "◈" : "⬡"} {formatNumber(listing.price)}
      </span>
    </Link>
  );
}

function ItemIcon({ kind }: { kind: string }) {
  const color = kind === "wood" ? "#8b5e34" : kind === "ore" ? "#707080" : kind === "pot" ? "#9d70ff" : "#00e5c8";

  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" className="h-9 w-9 shrink-0 border border-[rgba(180,140,255,0.4)] bg-[#0f0f1e]">
      <rect x="8" y="12" width="20" height="12" fill={color} opacity="0.85" />
      <polygon points="8,12 18,7 28,12 18,17" fill={color} opacity="0.55" />
      <polygon points="28,12 28,24 18,29 18,17" fill="#05050a" opacity="0.28" />
    </svg>
  );
}

function LoginCard() {
  return (
    <section className="border border-[rgba(130,100,220,0.2)] bg-[#141428] p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.16em]">Kintara Login</h2>
      <p className="mt-2 text-sm leading-6 text-[#b8afd9]">
        Enter as your avatar. TODO: implement Kintara username auth + avatar
        mirroring when official profile access exists.
      </p>
      <Link
        href="/account"
        className="kc-mono mt-4 inline-flex h-10 w-full items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[#0f0f1e] text-xs font-bold uppercase tracking-[0.16em] text-[#00e5c8] transition-transform hover:-translate-y-1"
      >
        Enter
      </Link>
    </section>
  );
}

function KinsTokenWidget({
  stats,
  isLoading,
  error,
}: {
  stats?: TokenStats;
  isLoading: boolean;
  error: Error | null;
}) {
  const change = stats?.priceChange24h;
  const isUp = (change ?? 0) >= 0;

  return (
    <section className="border border-[rgba(130,100,220,0.2)] bg-[#141428] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em]">$KINS Token</h2>
          <p className="kc-mono mt-3 text-3xl font-bold text-[#f5c842]">
            {isLoading ? "..." : stats?.priceUsd ? formatUsd(stats.priceUsd) : "N/A"}
          </p>
        </div>
        <span
          className={`kc-mono border px-2 py-1 text-xs font-bold ${isUp ? "border-[rgba(0,229,200,0.35)] text-[#00e5c8]" : "border-red-400/40 text-red-300"}`}
        >
          {change === undefined ? "N/A" : `${change.toFixed(2)}%`}
        </span>
      </div>
      {error ? (
        <p className="kc-mono mt-3 border border-red-400/35 bg-red-950/20 p-2 text-xs text-red-200">
          token feed unavailable
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <TokenStat label="Liquidity" value={stats?.liquidityUsd} />
        <TokenStat label="Vol 24h" value={stats?.volume24h} />
        <TokenStat label="Mkt Cap" value={stats?.marketCap} />
        <TokenStat label="FDV" value={stats?.fdv} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={stats?.pairUrl ?? "https://dexscreener.com/solana"}
          target="_blank"
          rel="noreferrer"
          className="kc-mono flex h-9 items-center justify-center gap-1 border border-[rgba(180,140,255,0.4)] bg-[#0f0f1e] text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff4da6]"
        >
          Dex <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`https://solscan.io/token/${process.env.NEXT_PUBLIC_KINS_MINT ?? "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump"}`}
          target="_blank"
          rel="noreferrer"
          className="kc-mono flex h-9 items-center justify-center gap-1 border border-[rgba(180,140,255,0.4)] bg-[#0f0f1e] text-[11px] font-bold uppercase tracking-[0.12em] text-[#00e5c8]"
        >
          Solscan <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}

function TokenStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="border border-[rgba(130,100,220,0.2)] bg-[#0f0f1e] p-2">
      <p className="kc-mono text-[10px] uppercase tracking-[0.14em] text-[#9e94c6]">
        {label}
      </p>
      <p className="kc-mono mt-1 text-sm font-bold text-white">
        {value === undefined ? "N/A" : `$${formatCompact(value)}`}
      </p>
    </div>
  );
}

function ClubNowList() {
  return (
    <section className="border border-[rgba(130,100,220,0.2)] bg-[#141428] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">In the Club Now</h2>
        <span className="kc-mono text-xs text-[#00e5c8]">{players.length}</span>
      </div>
      <div className="max-h-[292px] space-y-2 overflow-y-auto pr-1">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[#0f0f1e] p-2"
          >
            <MiniAvatar outfit={player.outfit} host={player.host} />
            <div>
              <p className="text-sm font-bold">{player.name}</p>
              <p className="kc-mono text-[10px] uppercase tracking-[0.12em] text-[#9e94c6]">
                Level {player.level}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NowPlayingBar({ track }: { track: QueueTrack }) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[10000] flex h-[52px] items-center gap-4 border-t border-[rgba(130,100,220,0.2)] bg-[#0a0a12] px-5">
      <div className="flex h-9 w-9 items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[#141428] text-xl">
        💿
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black uppercase tracking-[0.12em]">
          {track.track}
        </p>
        <p className="kc-mono truncate text-[10px] uppercase tracking-[0.14em] text-[#9e94c6]">
          DJ {track.dj.name} · Level {track.dj.level}
        </p>
      </div>
      <div className="ml-auto flex h-8 items-end gap-1">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            key={index}
            className="w-1 bg-[#00e5c8]"
            style={{
              animation: "kc-wave 0.9s ease-in-out infinite",
              animationDelay: `${index * 0.045}s`,
            }}
          />
        ))}
      </div>
    </footer>
  );
}

function PlayingBars() {
  return (
    <div className="flex h-5 items-end gap-0.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={index}
          className="w-1 bg-[#00e5c8]"
          style={{
            animation: "kc-bars 0.7s ease-in-out infinite",
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
