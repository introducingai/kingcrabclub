"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { fetchListings } from "@/lib/kintaraApi";
import { fetchDexScreenerKinsPairs } from "@/lib/tokenApi";
import { formatCompact, formatNumber, formatUsd } from "@/lib/format";
import type { MarketListing, TokenStats } from "@/lib/types";

type Outfit = "purple" | "red" | "blue" | "green" | "gold" | "ghost";

type ClubPlayer = {
  id: string;
  name: string;
  level: number;
  outfit: Outfit;
  x: number;
  y: number;
  host?: boolean;
};

type QueueTrack = {
  id: string;
  dj: ClubPlayer;
  track: string;
  source: "YouTube" | "SoundCloud";
  current?: boolean;
};

const players: ClubPlayer[] = [
  { id: "host", name: "000", level: 18, outfit: "gold", x: 48, y: 52, host: true },
  { id: "nyxen", name: "Nyxen", level: 20, outfit: "purple", x: 58, y: 42 },
  { id: "fish", name: "Fishcake", level: 8, outfit: "blue", x: 34, y: 48 },
  { id: "runner", name: "runner", level: 14, outfit: "red", x: 68, y: 61 },
  { id: "melly", name: "Melly", level: 12, outfit: "green", x: 42, y: 32 },
  { id: "book", name: "Book", level: 10, outfit: "blue", x: 76, y: 44 },
  { id: "alpha", name: "alphafi", level: 7, outfit: "purple", x: 28, y: 63 },
];

const queue: QueueTrack[] = [
  {
    id: "q1",
    dj: players[0],
    track: "Crab Market Open",
    source: "YouTube",
    current: true,
  },
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

const itemGlyphs = ["🪵", "⛏", "🧪", "🎣"];

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
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[var(--kc-void)] text-[#f8f3ff] [--kc-deep:#0f0f1e] [--kc-gold:#f5c842] [--kc-pink:#ff4da6] [--kc-purple:#9d70ff] [--kc-surface:#141428] [--kc-teal:#00e5c8] [font-family:'Space_Grotesk','Space Grotesk',Inter,ui-sans-serif,system-ui,sans-serif]">
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
            height: 8px;
          }
          50% {
            height: 28px;
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

        .kc-mono {
          font-family: "Space Mono", "Space_Mono", ui-monospace, SFMono-Regular,
            Menlo, Monaco, Consolas, monospace;
        }

        .kc-neon-sign {
          text-shadow:
            0 0 8px var(--kc-pink),
            0 0 18px rgba(255, 77, 166, 0.75),
            0 0 34px rgba(255, 77, 166, 0.45);
        }

        .kc-teal-glow {
          text-shadow:
            0 0 7px var(--kc-teal),
            0 0 18px rgba(0, 229, 200, 0.44);
        }
      `}</style>

      <header className="flex h-[76px] items-center justify-between border-b border-[rgba(130,100,220,0.2)] bg-[var(--kc-void)] px-6">
        <Link href="/degen" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[var(--kc-surface)] text-2xl transition-transform group-hover:-translate-y-1">
            🦀
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.12em] text-white">
              King Crab Club
            </h1>
            <p className="kc-mono mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[var(--kc-teal)]">
              Kintara World · Est. 2026
            </p>
          </div>
        </Link>

        <nav className="hidden items-center border border-[rgba(130,100,220,0.2)] bg-[var(--kc-deep)] p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="kc-mono px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#b8afd9] transition-colors hover:bg-[rgba(157,112,255,0.14)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="kc-mono flex items-center gap-2 border border-[rgba(0,229,200,0.35)] bg-[var(--kc-deep)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--kc-teal)]">
          <span className="h-2.5 w-2.5 bg-[var(--kc-teal)] [animation:kc-pulse-dot_1.2s_ease-in-out_infinite]" />
          {onlineCount} online
        </div>
      </header>

      <main className="grid h-[calc(100vh-76px)] grid-cols-1 gap-4 overflow-hidden p-4 pb-[84px] lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="relative min-h-[560px] overflow-hidden border border-[rgba(130,100,220,0.2)] bg-[var(--kc-deep)]">
          <IsoTileFloor />
          <NeonSign />
          <DjBoothSvg />

          {players.map((player) => (
            <SceneAvatar key={player.id} player={player} />
          ))}

          <Link
            href="/account"
            className="group absolute left-[18%] top-[38%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 transition-transform hover:-translate-y-[calc(50%+4px)]"
          >
            <PixelAvatar outfit="ghost" />
            <span className="kc-mono border border-dashed border-[rgba(180,140,255,0.4)] bg-[rgba(10,10,18,0.78)] px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[#b8afd9]">
              +you?
            </span>
          </Link>

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

function IsoTileFloor() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1100 720"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1100" height="720" fill="#0f0f1e" />
      <g opacity="0.8" transform="translate(550 340) rotate(45) scale(1 .52)">
        {Array.from({ length: 19 }).map((_, row) =>
          Array.from({ length: 25 }).map((__, col) => {
            const x = (col - 12) * 44;
            const y = (row - 9) * 44;
            const isAlt = (row + col) % 2 === 0;
            const dance =
              row >= 8 && row <= 12 && col >= 10 && col <= 14
                ? ["#9d70ff", "#ff4da6", "#00e5c8"][(row + col) % 3]
                : undefined;

            return (
              <rect
                key={`${row}-${col}`}
                x={x}
                y={y}
                width="44"
                height="44"
                fill={dance ?? (isAlt ? "#17172c" : "#121225")}
                stroke="#282042"
                strokeWidth="1"
                opacity={dance ? 0.38 : 1}
              />
            );
          }),
        )}
      </g>
      <g opacity="0.16">
        <rect x="0" y="0" width="1100" height="720" fill="#0a0a12" />
      </g>
      <rect x="65" y="72" width="970" height="560" fill="none" stroke="rgba(180,140,255,0.25)" />
    </svg>
  );
}

function NeonSign() {
  return (
    <div className="absolute left-8 top-8">
      <p className="kc-neon-sign text-3xl font-black uppercase tracking-[0.16em] text-[var(--kc-pink)]">
        ♛ King Crab Club
      </p>
      <p className="kc-mono kc-teal-glow mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--kc-teal)]">
        ▶ live session · kintara world
      </p>
    </div>
  );
}

function DjBoothSvg() {
  return (
    <svg
      aria-label="DJ booth"
      className="absolute right-8 top-10 h-[230px] w-[300px]"
      viewBox="0 0 300 230"
    >
      <g>
        <polygon points="80,72 238,20 286,76 128,128" fill="#151526" stroke="#9d70ff" />
        <polygon points="128,128 286,76 286,144 128,198" fill="#10101e" stroke="#4d3a7e" />
        <polygon points="80,72 128,128 128,198 80,140" fill="#0c0c18" stroke="#4d3a7e" />
        <rect x="130" y="70" width="118" height="48" fill="#0a0a12" stroke="#00e5c8" />
        <polyline
          points="140,96 152,88 164,102 176,82 188,102 202,92 216,98 236,78"
          fill="none"
          stroke="#00e5c8"
          strokeWidth="3"
        />
        <circle cx="124" cy="96" r="24" fill="#141428" stroke="#ff4da6" strokeWidth="3" />
        <circle cx="248" cy="66" r="22" fill="#141428" stroke="#9d70ff" strokeWidth="3" />
        <rect x="176" y="118" width="46" height="18" fill="#252541" stroke="#00e5c8" />
        <Speaker x={34} y={82} />
        <Speaker x={250} y={140} />
        <g transform="translate(172 8)">
          <rect x="18" y="16" width="22" height="24" fill="#111" />
          <rect x="14" y="34" width="30" height="34" fill="#22223a" stroke="#9d70ff" />
          <rect x="10" y="22" width="8" height="16" fill="#00e5c8" />
          <rect x="40" y="22" width="8" height="16" fill="#00e5c8" />
        </g>
      </g>
    </svg>
  );
}

function Speaker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="34" height="76" fill="#0a0a12" stroke="#3d315f" />
      <circle cx="17" cy="22" r="10" fill="#141428" stroke="#9d70ff" />
      <circle cx="17" cy="54" r="13" fill="#141428" stroke="#ff4da6" />
    </g>
  );
}

function SceneAvatar({ player }: { player: ClubPlayer }) {
  return (
    <div
      className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-transform hover:-translate-y-[calc(50%+4px)]"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      <PixelAvatar outfit={player.outfit} host={player.host} />
      <span className="text-center text-[12px] font-black leading-3 text-white [text-shadow:0_2px_0_#000,1px_0_0_#000,-1px_0_0_#000]">
        <span className="block text-[10px] text-[var(--kc-pink)]">Lvl {player.level}</span>
        {player.name}
      </span>
    </div>
  );
}

function PixelAvatar({
  outfit,
  host,
  small = false,
}: {
  outfit: Outfit;
  host?: boolean;
  small?: boolean;
}) {
  const colors: Record<Outfit, { body: string; hood: string; pants: string; skin: string }> = {
    purple: { body: "#6b3bd1", hood: "#17111f", pants: "#12121d", skin: "#d7b18e" },
    red: { body: "#c94141", hood: "#1b1111", pants: "#1a1720", skin: "#d7b18e" },
    blue: { body: "#2b68d8", hood: "#111827", pants: "#131827", skin: "#d7b18e" },
    green: { body: "#37a36b", hood: "#202616", pants: "#15191d", skin: "#d7b18e" },
    gold: { body: "#f5c842", hood: "#3d2c0b", pants: "#181412", skin: "#d7b18e" },
    ghost: { body: "transparent", hood: "transparent", pants: "transparent", skin: "transparent" },
  };
  const c = colors[outfit];
  const sizeClass = small ? "h-11 w-8" : "h-[44px] w-8";
  const opacity = outfit === "ghost" ? 0.55 : 1;

  return (
    <svg
      aria-hidden="true"
      className={sizeClass}
      viewBox="0 0 32 44"
      style={{ opacity }}
    >
      {outfit === "ghost" ? (
        <>
          <rect x="7" y="7" width="18" height="16" fill="none" stroke="#b48cff" strokeDasharray="3 2" />
          <rect x="5" y="22" width="22" height="17" fill="none" stroke="#b48cff" strokeDasharray="3 2" />
        </>
      ) : (
        <>
          {host ? <polygon points="8,2 13,8 16,2 19,8 24,2 24,10 8,10" fill="#f5c842" /> : null}
          <rect x="9" y="8" width="15" height="8" fill={c.hood} stroke="#05050a" />
          <rect x="8" y="15" width="17" height="14" fill={c.skin} stroke="#05050a" />
          <rect x="12" y="20" width="2" height="3" fill="#05050a" />
          <rect x="20" y="20" width="2" height="3" fill="#05050a" />
          <rect x="6" y="28" width="22" height="12" fill={c.body} stroke="#05050a" />
          <rect x="5" y="39" width="8" height="5" fill={c.pants} stroke="#05050a" />
          <rect x="20" y="39" width="8" height="5" fill={c.pants} stroke="#05050a" />
        </>
      )}
    </svg>
  );
}

function TurntableQueue() {
  return (
    <div className="border border-[rgba(130,100,220,0.2)] bg-[rgba(10,10,18,0.88)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">Turntable Queue</h2>
        <span className="kc-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kc-teal)]">
          room state
        </span>
      </div>
      <div className="space-y-2">
        {queue.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-2 transition-colors hover:bg-[rgba(157,112,255,0.14)]"
          >
            <PixelAvatar outfit={track.dj.outfit} host={track.dj.host} small />
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
    <div className="border border-[rgba(130,100,220,0.2)] bg-[rgba(10,10,18,0.88)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">Market Pulse</h2>
        <span className="kc-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kc-gold)]">
          latest
        </span>
      </div>
      <div className="space-y-2">
        {error ? (
          <p className="kc-mono border border-red-400/35 bg-red-950/20 p-3 text-xs text-red-200">
            market feed unavailable
          </p>
        ) : isLoading ? (
          <p className="kc-mono border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-3 text-xs text-[#9e94c6]">
            loading listings...
          </p>
        ) : listings.length > 0 ? (
          listings.map((listing, index) => (
            <MarketPulseItem key={listing.id} listing={listing} index={index} />
          ))
        ) : (
          <p className="kc-mono border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-3 text-xs text-[#9e94c6]">
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
      className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-2 transition-colors hover:bg-[rgba(157,112,255,0.14)]"
    >
      <span className="flex h-9 w-9 items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[var(--kc-deep)] text-lg">
        {itemGlyphs[index % itemGlyphs.length]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{listing.itemName}</p>
        <p className="kc-mono text-[10px] uppercase tracking-[0.12em] text-[#9e94c6]">
          x{formatNumber(listing.quantity)}
        </p>
      </div>
      <span
        className={`kc-mono text-xs font-bold ${isToken ? "text-[var(--kc-teal)]" : "text-[var(--kc-gold)]"}`}
      >
        {isToken ? "◈" : "⬡"} {formatNumber(listing.price)}
      </span>
    </Link>
  );
}

function LoginCard() {
  return (
    <section className="border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.16em]">Kintara Login</h2>
      <p className="mt-2 text-sm leading-6 text-[#b8afd9]">
        Enter as your avatar. TODO: implement Kintara username auth + avatar
        mirroring when official profile access exists.
      </p>
      <Link
        href="/account"
        className="kc-mono mt-4 inline-flex h-10 w-full items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[var(--kc-deep)] text-xs font-bold uppercase tracking-[0.16em] text-[var(--kc-teal)] transition-transform hover:-translate-y-1"
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
    <section className="border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em]">$KINS Token</h2>
          <p className="kc-mono mt-3 text-3xl font-bold text-[var(--kc-gold)]">
            {isLoading ? "..." : stats?.priceUsd ? formatUsd(stats.priceUsd) : "N/A"}
          </p>
        </div>
        <span
          className={`kc-mono border px-2 py-1 text-xs font-bold ${isUp ? "border-[rgba(0,229,200,0.35)] text-[var(--kc-teal)]" : "border-red-400/40 text-red-300"}`}
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
          className="kc-mono flex h-9 items-center justify-center gap-1 border border-[rgba(180,140,255,0.4)] bg-[var(--kc-deep)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--kc-pink)]"
        >
          Dex <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`https://solscan.io/token/${process.env.NEXT_PUBLIC_KINS_MINT ?? "Tqj8yFmagrg7oorpQkVGYR52r96RFTamvWfth9bpump"}`}
          target="_blank"
          rel="noreferrer"
          className="kc-mono flex h-9 items-center justify-center gap-1 border border-[rgba(180,140,255,0.4)] bg-[var(--kc-deep)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--kc-teal)]"
        >
          Solscan <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}

function TokenStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="border border-[rgba(130,100,220,0.2)] bg-[var(--kc-deep)] p-2">
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
    <section className="border border-[rgba(130,100,220,0.2)] bg-[var(--kc-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">In the Club Now</h2>
        <span className="kc-mono text-xs text-[var(--kc-teal)]">{players.length}</span>
      </div>
      <div className="max-h-[292px] space-y-2 overflow-y-auto pr-1">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 border border-[rgba(130,100,220,0.2)] bg-[var(--kc-deep)] p-2"
          >
            <PixelAvatar outfit={player.outfit} host={player.host} small />
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
    <footer className="fixed bottom-0 left-0 right-0 z-[60] flex h-[68px] items-center gap-4 border-t border-[rgba(130,100,220,0.2)] bg-[var(--kc-void)] px-6">
      <div className="flex h-11 w-11 items-center justify-center border border-[rgba(180,140,255,0.4)] bg-[var(--kc-surface)] text-2xl">
        💿
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black uppercase tracking-[0.12em]">
          {track.track}
        </p>
        <p className="kc-mono truncate text-[11px] uppercase tracking-[0.14em] text-[#9e94c6]">
          DJ {track.dj.name} · Level {track.dj.level}
        </p>
      </div>
      <div className="ml-auto flex h-8 items-end gap-1">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            key={index}
            className="w-1 bg-[var(--kc-teal)]"
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
          className="w-1 bg-[var(--kc-teal)]"
          style={{
            animation: "kc-bars 0.7s ease-in-out infinite",
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
