"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { fetchDexScreenerKinsPairs } from "@/lib/tokenApi";
import { fetchMerchantStatus } from "@/lib/merchantApi";
import { formatCompact, formatUsd } from "@/lib/format";
import type { TokenStats } from "@/lib/types";
import type { MerchantStatus } from "@/lib/merchantApi";

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
  url?: string;
  embedUrl?: string;
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

const INITIAL_QUEUE: QueueTrack[] = [
  { id: "q1", dj: players[0], track: "Crab Market Open", source: "YouTube", current: true },
  { id: "q2", dj: players[2], track: "Beach Alpha Hour", source: "SoundCloud" },
  { id: "q3", dj: players[1], track: "Potion Floor Sweep", source: "YouTube" },
  { id: "q4", dj: players[5], track: "Dockside Loop", source: "SoundCloud" },
];

function parseMediaUrl(url: string): {
  source: "YouTube" | "SoundCloud";
  embedUrl: string;
  title: string;
} | null {
  const clean = url.trim();
  const yt = clean.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt) {
    return {
      source: "YouTube",
      embedUrl: `https://www.youtube.com/embed/${yt[1]}?autoplay=1`,
      title: "YouTube Track",
    };
  }
  if (clean.match(/^https?:\/\/(www\.)?soundcloud\.com\//)) {
    return {
      source: "SoundCloud",
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&auto_play=true&color=%2300e5c8&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      title: "SoundCloud Track",
    };
  }
  return null;
}



function isoDiamond(cx: number, cy: number, width: number, height: number) {
  return `${cx},${cy - height / 2} ${cx + width / 2},${cy} ${cx},${cy + height / 2} ${cx - width / 2},${cy}`;
}

function isoBoxPoints(cx: number, cy: number, w: number, h: number, depth: number) {
  const hw = w / 2, hh = h / 2;
  return {
    top:   `${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`,
    left:  `${cx-hw},${cy} ${cx},${cy+hh} ${cx},${cy+hh+depth} ${cx-hw},${cy+depth}`,
    right: `${cx},${cy+hh} ${cx+hw},${cy} ${cx+hw},${cy+depth} ${cx},${cy+hh+depth}`,
  };
}

export function DegenClubRoom() {
  const [queue, setQueue] = useState<QueueTrack[]>(INITIAL_QUEUE);

  const tokenQuery = useQuery({
    queryKey: ["king-crab-kins"],
    queryFn: fetchDexScreenerKinsPairs,
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 60000 : 30000,
    placeholderData: (previous) => previous,
  });
  const merchantQuery = useQuery({
    queryKey: ["king-crab-merchant"],
    queryFn: fetchMerchantStatus,
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? 120_000 : 60_000,
    retry: false,
  });

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
            0 0 8px #ff2d6b,
            0 0 18px rgba(255, 45, 107, 0.72);
        }

        .kc-avatar-bob {
          animation: kc-avatar-bob 1.9s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes kc-tile-a {
          0%, 100% { opacity: 0.72; }
          50% { opacity: 1; }
        }

        @keyframes kc-tile-b {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.92; }
        }

        .kc-tile-a { animation: kc-tile-a 1.6s ease-in-out infinite; }
        .kc-tile-b { animation: kc-tile-b 1.6s ease-in-out infinite; }

        @keyframes kc-sweep-l {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }

        @keyframes kc-sweep-r {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }

        .kc-light-l {
          transform-origin: 730px 280px;
          animation: kc-sweep-l 3s ease-in-out infinite;
        }

        .kc-light-r {
          transform-origin: 790px 280px;
          animation: kc-sweep-r 3s ease-in-out infinite 0.8s;
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

        <nav className="hidden items-center border border-[rgba(130,100,220,0.2)] bg-[#0f0f1e] p-0.5 md:flex">
          {[
            { href: "/", label: "Home" },
            { href: "/market", label: "Market" },
            { href: "/market/wood", label: "Stats" },
            { href: "/account", label: "Account" },
          ].map((item) => (
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

      <main className="grid h-[calc(100vh-52px)] grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <section className="relative overflow-hidden border-r border-[rgba(130,100,220,0.2)] bg-[#0a0a1a]">
          <ClubSceneSvg />
        </section>
        <aside className="flex flex-col divide-y divide-[rgba(130,100,220,0.15)] overflow-y-auto bg-[#0a0a12] pb-[64px]">
          <TurntableQueue queue={queue} setQueue={setQueue} />
          <KinsTokenWidget
            stats={tokenQuery.data}
            isLoading={tokenQuery.isLoading}
            error={tokenQuery.isError ? tokenQuery.error : null}
          />
          <MerchantWidget
            status={merchantQuery.data}
            isLoading={merchantQuery.isLoading}
            error={merchantQuery.isError ? (merchantQuery.error as Error) : null}
          />
          <ClubNowList />
          <LoginCard />
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
      const cx = 480 + (col - row) * 38;
      const cy = 390 + (col + row) * 20;
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
      <defs>
        <radialGradient id="kc-light-glow-l" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#9d70ff" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#9d70ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="kc-light-glow-r" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#00e5c8" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#00e5c8" stopOpacity="0"/>
        </radialGradient>
        <filter id="kc-neon-pink" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="kc-neon-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="kc-dance-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9848c8" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#9848c8" stopOpacity="0"/>
        </radialGradient>
        <filter id="kc-tile-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
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
      <StageLights />
      <RestroomSigns />
      <LoungeTables />
      {/* Plants — placed to match target image positions */}
      <PlantPot x={558} y={208} />
      <PlantPot x={626} y={192} />
      <PlantPot x={880} y={314} />
      <PlantPot x={390} y={628} />
      <PlantPot x={478} y={658} />
      {/* EXIT sign */}
      <rect x="72" y="270" width="34" height="15" fill="#001800" stroke="#00d000" strokeWidth="0.6"/>
      <text x="89" y="281" textAnchor="middle" fill="#00d000" fontFamily="Space Mono, monospace" fontSize="7" fontWeight="700">EXIT</text>

      {/* Dance floor ambient glow */}
      <ellipse cx="480" cy="450" rx="160" ry="88" fill="url(#kc-dance-glow)"/>
      {/* Glow pass — blurred, no stroke, same tiles behind */}
      <g filter="url(#kc-tile-glow)" opacity="0.7">
        {danceTiles.map((tile) => {
          const isA = (tile.row + tile.col) % 2 === 0;
          return (
            <polygon
              key={`g-${tile.id}`}
              points={isoDiamond(tile.cx, tile.cy, 70, 36)}
              fill={isA ? "#d068c8" : "#5888d8"}
            />
          );
        })}
      </g>
      {/* Crisp tile pass on top — dark stroke creates grid separators */}
      <g>
        {danceTiles.map((tile) => {
          const isA = (tile.row + tile.col) % 2 === 0;
          return (
            <polygon
              key={tile.id}
              className={isA ? "kc-tile-a" : "kc-tile-b"}
              style={{ animationDelay: `${(tile.row * 4 + tile.col) * 0.08}s` }}
              points={isoDiamond(tile.cx, tile.cy, 70, 36)}
              fill={isA ? "#d068c8" : "#5888d8"}
              stroke="#04020a"
              strokeWidth="2"
            />
          );
        })}
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
      <g filter="url(#kc-neon-pink)">
        <rect x="35" y="8" width="184" height="24" fill="#ff2d6b" opacity="0.16" />
        <circle cx="18" cy="20" r="15" fill="#ff2d6b" opacity="0.18" />
        <circle cx="18" cy="20" r="11" fill="none" stroke="#ff2d6b" strokeWidth="2" />
        <rect x="10" y="18" width="16" height="4" fill="#ff2d6b" />
        <rect x="6" y="15" width="5" height="3" fill="#ff2d6b" />
        <rect x="25" y="15" width="5" height="3" fill="#ff2d6b" />
        <text
          x="42"
          y="24"
          fill="#ff2d6b"
          fontFamily="Space Mono, monospace"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2"
        >
          KING CRAB CLUB
        </text>
      </g>
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
      {/* bottom front LED strip — purple */}
      <line x1="168" y1="264" x2="396" y2="223" stroke="#8040e0" strokeWidth="2.5" opacity="0.9" filter="url(#kc-neon-cyan)"/>
      <line x1="136" y1="168" x2="342" y2="139" stroke="#ff2d6b" strokeWidth="2" opacity="0.8" filter="url(#kc-neon-pink)" />
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
      {/* Cyan vertical bar — far right wall accent */}
      <rect x="924" y="80" width="12" height="230" fill="#081830"/>
      <rect x="924" y="80" width="12" height="230" fill="none" stroke="#00b8ff" strokeWidth="1.5" opacity="0.75"/>
      <rect x="926" y="82" width="4" height="226" fill="#00c0ff" opacity="0.55"/>

      {/* Left light rig arm */}
      <line x1="648" y1="126" x2="606" y2="214" stroke="#071428" strokeWidth="16" strokeLinecap="round"/>
      <line x1="648" y1="126" x2="606" y2="214" stroke="#1858d8" strokeWidth="7"  strokeLinecap="round" opacity="0.9"/>
      <line x1="648" y1="126" x2="606" y2="214" stroke="#60a8ff" strokeWidth="2"  strokeLinecap="round" opacity="0.7"/>
      <line x1="606" y1="214" x2="596" y2="274" stroke="#071428" strokeWidth="13" strokeLinecap="round"/>
      <line x1="606" y1="214" x2="596" y2="274" stroke="#1048b0" strokeWidth="5"  strokeLinecap="round" opacity="0.8"/>

      {/* Right light rig arm */}
      <line x1="820" y1="134" x2="866" y2="222" stroke="#071428" strokeWidth="16" strokeLinecap="round"/>
      <line x1="820" y1="134" x2="866" y2="222" stroke="#1858d8" strokeWidth="7"  strokeLinecap="round" opacity="0.9"/>
      <line x1="820" y1="134" x2="866" y2="222" stroke="#60a8ff" strokeWidth="2"  strokeLinecap="round" opacity="0.7"/>
      <line x1="866" y1="222" x2="876" y2="280" stroke="#071428" strokeWidth="13" strokeLinecap="round"/>
      <line x1="866" y1="222" x2="876" y2="280" stroke="#1048b0" strokeWidth="5"  strokeLinecap="round" opacity="0.8"/>

      {/* DJ booth platform */}
      <polygon points="650,177 833,211 792,296 610,258" fill="#18183a" stroke="#4a30c0" strokeWidth="2" />
      <polygon points="610,258 792,296 792,318 610,280" fill="#101026" stroke="#1e1848" />
      <polygon points="650,177 610,258 610,280 650,198" fill="#0d0d24" stroke="#1e1848" />
      {/* booth base LED strip — purple */}
      <line x1="612" y1="277" x2="792" y2="315" stroke="#8040e0" strokeWidth="2" opacity="0.85" filter="url(#kc-neon-cyan)"/>

      {/* Turntables */}
      <ellipse cx="682" cy="230" rx="27" ry="16" fill="#080814" stroke="#9d70ff" strokeWidth="2" />
      <ellipse cx="682" cy="230" rx="12" ry="7" fill="#17172f" />
      <circle cx="682" cy="230" r="4" fill="#9d70ff" />
      <ellipse cx="756" cy="244" rx="27" ry="16" fill="#080814" stroke="#00e5c8" strokeWidth="2" />
      <ellipse cx="756" cy="244" rx="12" ry="7" fill="#17172f" />
      <circle cx="756" cy="244" r="4" fill="#00e5c8" />

      {/* Mixer */}
      <rect x="712" y="229" width="26" height="31" fill="#0c0c22" stroke="#514299" />
      <rect x="718" y="234" width="3" height="20" fill="#ff2d6b" />
      <rect x="725" y="234" width="3" height="20" fill="#00e5c8" />
      <rect x="732" y="234" width="3" height="20" fill="#9d70ff" />

      {/* Waveform */}
      <rect x="696" y="193" width="80" height="27" fill="#080814" stroke="#00e5c8" />
      <polyline points="702,211 712,205 722,214 732,198 742,213 752,207 764,210 772,201" fill="none" stroke="#00e5c8" strokeWidth="2" />

      <SpeakerSvg x={596} y={200} />
      <SpeakerSvg x={820} y={234} />
      <AvatarSprite x={724} y={190} outfit="gold" label="dj" crown />
    </g>
  );
}

function StageLights() {
  return (
    <>
      <g className="kc-light-l">
        <polygon points="730,280 718,400 742,400" fill="url(#kc-light-glow-l)" opacity="0.6"/>
      </g>
      <g className="kc-light-r">
        <polygon points="790,280 776,406 804,406" fill="url(#kc-light-glow-r)" opacity="0.5"/>
      </g>
      <rect x="722" y="276" width="16" height="8" fill="#1a1848" stroke="#9d70ff"/>
      <rect x="782" y="276" width="16" height="8" fill="#1a1848" stroke="#00e5c8"/>
    </>
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
  const couch = isoBoxPoints(534, 148, 130, 54, 18);
  const couchBack = isoBoxPoints(520, 130, 126, 26, 28);
  const tableTop = isoBoxPoints(534, 162, 52, 24, 6);
  return (
    <g>
      {/* VIP platform */}
      <polygon points="430,152 572,126 640,157 492,190" fill="#18183a" stroke="#2c2460" />
      <polygon points="492,190 640,157 640,179 492,212" fill="#101026" />

      {/* Couch back rest */}
      <polygon points={couchBack.top}   fill="#2e1a58" stroke="#3a2470"/>
      <polygon points={couchBack.left}  fill="#1e0f3c" stroke="#3a2470" strokeWidth="0.5"/>
      <polygon points={couchBack.right} fill="#251548" stroke="#3a2470" strokeWidth="0.5"/>

      {/* Couch seat */}
      <polygon points={couch.top}   fill="#3a2468" stroke="#4a3080"/>
      <polygon points={couch.left}  fill="#221440" stroke="#4a3080" strokeWidth="0.5"/>
      <polygon points={couch.right} fill="#2c1c52" stroke="#4a3080" strokeWidth="0.5"/>

      {/* Coffee table */}
      <polygon points={tableTop.top}   fill="#1c1838" stroke="#302860"/>
      <polygon points={tableTop.left}  fill="#0f0d20" stroke="#302860" strokeWidth="0.5"/>
      <polygon points={tableTop.right} fill="#141230" stroke="#302860" strokeWidth="0.5"/>
      {/* Gem on table */}
      <circle cx="534" cy="156" r="5" fill="#00e5c8" opacity="0.7"/>
      <circle cx="534" cy="156" r="3" fill="white" opacity="0.6"/>

      {/* VIP sign (filtered glow) */}
      <text x="492" y="120" fill="#9d70ff" fontFamily="Space Mono, monospace" fontSize="12" fontWeight="700" letterSpacing="2" filter="url(#kc-neon-cyan)">
        VIP
      </text>

      {/* Gold rope barriers */}
      <rect x="430" y="196" width="5" height="22" fill="#f5c842" />
      <rect x="498" y="208" width="5" height="22" fill="#f5c842" />
      <line x1="435" y1="205" x2="498" y2="219" stroke="#f5c842" strokeWidth="1.5" opacity="0.7" />
      <rect x="604" y="184" width="5" height="22" fill="#f5c842" />
      <rect x="662" y="194" width="5" height="22" fill="#f5c842" />
      <line x1="609" y1="193" x2="662" y2="205" stroke="#f5c842" strokeWidth="1.5" opacity="0.7" />
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
      <text x="875" y="158" textAnchor="middle" fill="#ff2d6b" fontFamily="Space Mono, monospace" fontSize="18">
        ♀
      </text>
    </g>
  );
}

function LoungeSofa({ cx, cy }: { cx: number; cy: number }) {
  const seat = isoBoxPoints(cx, cy, 58, 28, 10);
  const back = isoBoxPoints(cx - 6, cy - 16, 54, 16, 22);
  return (
    <g>
      <polygon points={back.top}   fill="#1d1a1c" stroke="#272325" strokeWidth="0.6"/>
      <polygon points={back.left}  fill="#100e0f" stroke="#272325" strokeWidth="0.4"/>
      <polygon points={back.right} fill="#171415" stroke="#272325" strokeWidth="0.4"/>
      <polygon points={seat.top}   fill="#252020" stroke="#2e2828" strokeWidth="0.6"/>
      <polygon points={seat.left}  fill="#131010" stroke="#2e2828" strokeWidth="0.4"/>
      <polygon points={seat.right} fill="#1c1818" stroke="#2e2828" strokeWidth="0.4"/>
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
      {/* velvet rope */}
      <line x1="176" y1="548" x2="476" y2="640" stroke="#8b0000" strokeWidth="3" opacity="0.8" />
      <line x1="208" y1="504" x2="616" y2="626" stroke="#8b0000" strokeWidth="2" opacity="0.5" />
      {/* rope posts */}
      {[{ x: 180, y: 540 }, { x: 330, y: 580 }, { x: 476, y: 634 }].map((p) => (
        <rect key={`rp-${p.x}`} x={p.x - 2} y={p.y - 18} width="4" height="18" fill="#c8a030"/>
      ))}

      {tables.map((table) => (
        <g key={`${table.x}-${table.y}`}>
          {/* sofa south of table */}
          <LoungeSofa cx={table.x} cy={table.y + 22} />
          {/* table shadow */}
          <polygon points={isoDiamond(table.x, table.y + 4, 66, 34)} fill="#0a081a"/>
          {/* table legs (front face) */}
          <polygon
            points={`${table.x - 32},${table.y} ${table.x},${table.y + 16} ${table.x},${table.y + 26} ${table.x - 32},${table.y + 10}`}
            fill="#0d0b1e" stroke="#1e1a38" strokeWidth="0.5"
          />
          {/* table top */}
          <polygon points={isoDiamond(table.x, table.y, 64, 32)} fill="#1a1838" stroke="#2a2450" strokeWidth="0.8"/>
          {/* gem / candle */}
          <circle cx={table.x} cy={table.y - 5} r="5" fill="#9d70ff" opacity="0.5"/>
          <circle cx={table.x} cy={table.y - 5} r="3" fill="#c8a8ff" opacity="0.7"/>
        </g>
      ))}
    </g>
  );
}

function PlantPot({ x, y }: { x: number; y: number }) {
  const pot = isoBoxPoints(x, y, 22, 11, 14);
  return (
    <g>
      <polygon points={pot.top}   fill="#2e2e36" stroke="#3a3a44" strokeWidth="0.6"/>
      <polygon points={pot.left}  fill="#1c1c22" stroke="#3a3a44" strokeWidth="0.4"/>
      <polygon points={pot.right} fill="#242428" stroke="#3a3a44" strokeWidth="0.4"/>
      <circle cx={x - 2} cy={y - 20} r="9"  fill="#1e4020" opacity="0.95"/>
      <circle cx={x + 5} cy={y - 24} r="7"  fill="#286030" opacity="0.9"/>
      <circle cx={x - 6} cy={y - 25} r="6"  fill="#1a3818" opacity="0.95"/>
    </g>
  );
}

function SceneAvatarSvg({ player }: { player: ClubPlayer }) {
  return (
    <g transform={`translate(${player.x} ${player.y})`}>
      <text x="0" y="-48" textAnchor="middle" fill="#ff2d6b" fontFamily="Space Mono, monospace" fontSize="9" fontWeight="700">
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

function TurntableQueue({
  queue,
  setQueue,
}: {
  queue: QueueTrack[];
  setQueue: React.Dispatch<React.SetStateAction<QueueTrack[]>>;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const currentTrack = queue.find((t) => t.current);

  function playTrack(id: string) {
    setQueue((prev) => prev.map((t) => ({ ...t, current: t.id === id })));
  }

  function removeTrack(id: string) {
    setQueue((prev) => {
      const wasCurrent = prev.find((t) => t.id === id)?.current;
      const filtered = prev.filter((t) => t.id !== id);
      if (wasCurrent && filtered.length > 0) {
        filtered[0] = { ...filtered[0], current: true };
      }
      return filtered;
    });
  }

  function skipNext() {
    setQueue((prev) => {
      const idx = prev.findIndex((t) => t.current);
      const next = idx < prev.length - 1 ? idx + 1 : 0;
      return prev.map((t, i) => ({ ...t, current: i === next }));
    });
  }

  function addToQueue() {
    const parsed = parseMediaUrl(urlInput);
    if (!parsed) {
      setUrlError("Paste a YouTube or SoundCloud URL");
      return;
    }
    const newTrack: QueueTrack = {
      id: `q-${Date.now()}`,
      dj: players[0],
      track: parsed.title,
      source: parsed.source,
      url: urlInput.trim(),
      embedUrl: parsed.embedUrl,
    };
    setQueue((prev) => [...prev, newTrack]);
    setUrlInput("");
    setUrlError("");
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">DJ Queue</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={skipNext}
            className="kc-mono text-[10px] text-[#9e94c6] transition-colors hover:text-white"
          >
            ⏭ Skip
          </button>
          <span className="kc-mono text-[10px] uppercase tracking-[0.14em] text-[#00e5c8]">
            {queue.length} tracks
          </span>
        </div>
      </div>

      {/* Embedded player */}
      {currentTrack?.embedUrl && (
        <div className="mb-3 overflow-hidden border border-[rgba(130,100,220,0.25)]">
          <iframe
            key={currentTrack.id}
            src={currentTrack.embedUrl}
            width="100%"
            height={currentTrack.source === "YouTube" ? "152" : "100"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title={currentTrack.track}
          />
        </div>
      )}

      {/* Queue list */}
      <div className="mb-3 max-h-[200px] space-y-1.5 overflow-y-auto">
        {queue.map((track) => (
          <div
            key={track.id}
            className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
              track.current
                ? "border-[rgba(157,112,255,0.5)] bg-[rgba(157,112,255,0.12)]"
                : "border-[rgba(130,100,220,0.2)] bg-[#141428] hover:bg-[rgba(157,112,255,0.08)]"
            }`}
            onClick={() => playTrack(track.id)}
          >
            <MiniAvatar outfit={track.dj.outfit} host={track.dj.host} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{track.track}</p>
              <p className="kc-mono text-[9px] uppercase tracking-[0.1em] text-[#9e94c6]">
                {track.dj.name} · {track.source}
              </p>
            </div>
            {track.current ? (
              <PlayingBars />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrack(track.id);
                }}
                className="kc-mono shrink-0 text-[9px] text-[#9e94c6] hover:text-[#ff2d6b]"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add to queue */}
      <div className="space-y-1.5">
        <input
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setUrlError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addToQueue()}
          placeholder="YouTube or SoundCloud URL…"
          className="kc-mono w-full border border-[rgba(130,100,220,0.3)] bg-[#0a0a18] px-2 py-1.5 text-[10px] text-white placeholder-[#4a4468] focus:border-[rgba(157,112,255,0.6)] focus:outline-none"
        />
        {urlError && (
          <p className="kc-mono text-[9px] text-[#ff2d6b]">{urlError}</p>
        )}
        <button
          onClick={addToQueue}
          className="kc-mono w-full border border-[rgba(157,112,255,0.4)] bg-[rgba(157,112,255,0.08)] py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9d70ff] transition-colors hover:bg-[rgba(157,112,255,0.18)]"
        >
          + Add to Queue
        </button>
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
          className="kc-mono flex h-9 items-center justify-center gap-1 border border-[rgba(180,140,255,0.4)] bg-[#0f0f1e] text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff2d6b]"
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

const MERCHANT_RESOURCES = [
  { key: "wood"       as const, color: "#f5c842", track: "#1a1200" },
  { key: "stone"      as const, color: "#909098", track: "#14141e" },
  { key: "coal"       as const, color: "#5060a0", track: "#0e1018" },
  { key: "cookedFish" as const, color: "#00e5c8", track: "#001818" },
];

function MerchantWidget({
  status,
  isLoading,
  error,
}: {
  status?: MerchantStatus;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <section className="border border-[rgba(245,200,66,0.22)] bg-[#141428] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🧙</span>
          <h2 className="text-xs font-black uppercase tracking-[0.18em]">
            Traveling Merchant
          </h2>
        </div>
        {!isLoading && !error && status && (
          <span
            className={`kc-mono border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
              status.isOutOfGold
                ? "border-[rgba(255,45,107,0.4)] text-[#ff2d6b]"
                : "border-[rgba(0,229,200,0.35)] text-[#00e5c8]"
            }`}
          >
            {status.isOutOfGold ? "No Gold" : "In Town"}
          </span>
        )}
      </div>

      {error ? (
        <p className="kc-mono text-[10px] text-[#9e94c6]">
          Merchant data unavailable
        </p>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse bg-[#0f0f26]" />
          ))}
        </div>
      ) : status ? (
        <>
          <div className="space-y-3">
            {MERCHANT_RESOURCES.map(({ key, color, track }) => {
              const res = status.resources[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="kc-mono text-[10px] uppercase tracking-[0.1em] text-[#b8afd9]">
                      {res.name}
                    </span>
                    <span
                      className="kc-mono text-[10px] font-bold"
                      style={{ color }}
                    >
                      {res.current.toLocaleString()} / {res.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full" style={{ background: track }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${res.percent}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 border border-[rgba(245,200,66,0.18)] bg-[#0f0f1e] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="kc-mono text-[9px] uppercase tracking-[0.16em] text-[#9e94c6]">
                  Avg filled
                </p>
                <p className="kc-mono text-base font-bold text-[#f5c842]">
                  {status.avgFillPercent.toFixed(0)}%
                </p>
              </div>
              {status.estimatedReturnHours !== undefined && (
                <div className="text-right">
                  <p className="kc-mono text-[9px] uppercase tracking-[0.16em] text-[#9e94c6]">
                    Returns in
                  </p>
                  <p className="kc-mono text-base font-bold text-[#f5c842]">
                    ~{status.estimatedReturnHours}h
                  </p>
                </div>
              )}
            </div>
            {status.fillCostUsd !== undefined && (
              <p className="kc-mono mt-2 border-t border-[rgba(245,200,66,0.12)] pt-2 text-[10px] text-[#9e94c6]">
                Fill cost{" "}
                <span className="font-bold text-[#f5c842]">
                  ${status.fillCostUsd.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </>
      ) : null}
    </section>
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
