# King Crab Club — Claude Code Brief

## What this project is

A **Kintara World companion web app** — part DJ room (turntable.fm / plug.dj aesthetic), part market companion, all inside the visual language of Kintara's isometric voxel world. The long-game goal is to become the de-facto social layer for Kintara players and lobby to get officially embedded inside the Kintara map.

**Reference images (saved in `docs/`):**
- `kintara-forest.png` — Kintara's actual isometric tile/avatar style (the ground truth for voxel proportions)
- `kintara-hover.png` — How tile selection/hover highlighting works in-game (tile glows, avatars occupy single tiles)
- `kcc-target.png` — The target interior: dark nightclub, pink/cyan neons, dance floor, DJ booth, bar, VIP
- `kcc-current.png` — Current state (what we're fixing — flat hero, no real isometric scene)

---

## Design System (non-negotiable, extracted from target reference)

```css
/* Core palette — hard-coded, not Tailwind defaults */
--void:    #080810;   /* backgrounds, deepest */
--deep:    #0c0c1e;   /* panel backgrounds */
--surface: #10102a;   /* card surfaces */
--panel:   #141432;   /* elevated panels */
--border:  rgba(130,100,220,0.22);
--border-hi: rgba(180,140,255,0.45);

/* Neon accents */
--pink:    #ff2d6b;   /* bar sign, "Lvl" labels, entry neon */
--cyan:    #00e5c8;   /* DJ booth, live indicator, wave */
--purple:  #9d70ff;   /* dance floor, VIP, hover states */
--gold:    #f5c842;   /* velvet rope posts, crown, $KINS price */

/* Type */
--font-ui:   'Space Grotesk', sans-serif;
--font-mono: 'Space Mono', monospace;
```

**Typography rules:**
- UI labels → Space Grotesk, `font-weight: 900`, `letter-spacing: 0.12–0.18em`, `text-transform: uppercase`
- Data/metadata → Space Mono, small, `letter-spacing: 0.12–0.14em`
- Player name labels in scene → Space Mono, white, 9–11px
- "Lvl XX" labels → Space Mono, `--pink`, 8–9px

---

## Isometric Grid System

Kintara uses a **2:1 diamond tile** (classic ISO). Match it exactly:

```
Tile width:  76px (in SVG coordinate space)
Tile height: 40px
Iso angle:   ~26.6° (arctan(0.5))
Projection:  (col - row) * 38 for X, (col + row) * 20 for Y
```

Diamond formula for a tile centered at (cx, cy):
```
points = `${cx},${cy-20} ${cx+38},${cy} ${cx},${cy+20} ${cx-38},${cy}`
```

### Avatar tile rules (copying Kintara logic from screenshots)
- Each avatar **occupies exactly 1 tile** in the iso grid
- On hover: the tile under the avatar **highlights** (cyan/purple glow, like the mine highlight in `kintara-hover.png`)
- Objects (DJ booth, bar, VIP area, speaker columns) **block tiles** — player avatars cannot stand there
- Z-ordering: avatars with **higher iso Y** render **in front** (sort by `isoY` descending before rendering)
- Avatar follow logic: tile selection ring appears when a player is clicked (dotted diamond outline, same style as the mine selection in screenshots)

### Voxel character proportions (from Kintara screenshots)
```
Hood/hat:     8w × 7h px
Head:         10w × 8h px  (skin #d7b18e)
Body:         14w × 20h px (outfit color)
Arms (×2):    4w × 8h px   (offset -3 left, +7 right from body)
Legs (×2):    5w × 8h px   (offset 0 left, +7 right from bottom of body)
Total height: ~51px in SVG space
```

Crown (host only): `<polygon points="3,0 8,6 11,0 14,6 19,0 19,8 3,8" fill="#f5c842"/>`

Outfit colors:
```js
gold:   { body: '#f5c842', hood: '#3d2c0b', pants: '#181412' }
purple: { body: '#6b3bd1', hood: '#17111f', pants: '#11111e' }
blue:   { body: '#2b68d8', hood: '#101827', pants: '#121827' }
green:  { body: '#37a36b', hood: '#202616', pants: '#13191d' }
red:    { body: '#c94141', hood: '#1b1111', pants: '#17121d' }
```

---

## Component Spec

### `DegenClubRoom.tsx` — the main component

**Current problem:** The `ClubSceneSvg` function builds the scene, but:
1. Dance floor tiles have no stagger-delay animation (just static opacity)
2. Stage lights are static rectangles (no sweep animation)
3. Avatar bob is CSS-only with no Framer Motion (add FM for enter/exit)
4. No tile hover interaction (the defining mechanic of Kintara)
5. Avatar z-ordering is hardcoded, not sorted by iso Y position

**Fix plan:**

#### 1. Install Framer Motion
```bash
npm install framer-motion
```

#### 2. Animate dance floor tiles
Wrap each dance tile in `<motion.polygon>` with staggered pulse:
```tsx
// In ClubSceneSvg, replace static dance tiles with:
<motion.polygon
  key={tile.id}
  points={isoDiamond(tile.cx, tile.cy, 82, 44)}
  fill={(tile.row + tile.col) % 2 === 0 ? '#281890' : '#201678'}
  stroke={(tile.row + tile.col) % 2 === 0 ? '#5040e0' : '#4030c8'}
  strokeWidth="1"
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{
    duration: 1.6,
    repeat: Infinity,
    delay: (tile.row * 4 + tile.col) * 0.08,
    ease: 'easeInOut'
  }}
/>
// NOTE: framer-motion doesn't support SVG polygon natively for all props —
// use a <motion.g> wrapper with animate={{ opacity }} instead if needed
```

#### 3. Animate stage lights (sweep)
```tsx
// Replace static stage light lines with:
<motion.polygon
  points="730,280 718,400 742,400"
  fill="url(#light-glow-l)"
  style={{ originX: '730px', originY: '280px' }}
  animate={{ rotate: [-22, 22, -22] }}
  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
/>
```

#### 4. Queue item enter/exit animations
```tsx
// Wrap TurntableQueue items in AnimatePresence:
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {queue.map((track, i) => (
    <motion.div
      key={track.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.28, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-center gap-3 border ..."
    >
      ...
    </motion.div>
  ))}
</AnimatePresence>
```

#### 5. Avatar tile hover interaction
```tsx
// Add to SceneAvatarSvg — tile highlight on hover:
const [hovered, setHovered] = useState(false)

// Render the tile glow diamond behind the avatar:
{hovered && (
  <motion.polygon
    points={isoDiamond(0, 8, 82, 44)} // offset to ground level
    fill="#00e5c8"
    opacity={0.25}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.25 }}
    exit={{ opacity: 0 }}
    stroke="#00e5c8"
    strokeWidth="1.5"
  />
)}
<g
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  className="cursor-pointer"
>
  <AvatarSprite ... />
</g>
```

#### 6. Avatar z-sort
```tsx
// Sort players before rendering so southern avatars appear in front:
const sortedPlayers = [...players].sort((a, b) => a.y - b.y)
// Then: {sortedPlayers.map(player => <SceneAvatarSvg ... />)}
```

#### 7. Avatar enter animation (AnimatePresence)
```tsx
// Wrap SceneAvatarSvg render in AnimatePresence:
<AnimatePresence>
  {sortedPlayers.map(player => (
    <motion.g
      key={player.id}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ duration: 0.35, delay: player.delay }}
      style={{ transformOrigin: `${player.x}px ${player.y}px` }}
    >
      <SceneAvatarSvg player={player} />
    </motion.g>
  ))}
</AnimatePresence>
```

---

### `NowPlayingBar` — waveform

Current: CSS animation with `kc-wave` keyframes. Works but bars are static array.

**Enhancement:** Vary bar heights randomly on track change using Framer Motion:
```tsx
function PlayingWave() {
  return (
    <div className="flex items-end gap-0.5 h-8 ml-auto">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 bg-[#00e5c8]"
          animate={{ height: ['4px', `${8 + Math.random() * 18}px`, '4px'] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.045,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}
```

---

## Kintara Reverse Engineering Notes

### What we know (from screenshots + extension code)

**Tile system:** The Kintara world uses standard 2:1 isometric tiles. The mine object in screenshot 1 appears within roughly a 2-tile radius of the player character. The axe hover in screenshot 2 highlights the tree's occupied tile (single tile, darker outline + teal/green glow). This confirms:
- Objects = tile-occupying entities
- Interaction range = ~2 tile radius from player
- Hover = tile highlight (CSS or SVG overlay on the tile diamond)

**Character data the extension can scrape** (`extension/content.js`):
The extension injects into `kintara.gg` DOM. The content script already reads `companionBaseUrl` and `degenDjUrl`. The approach to get player data:

```js
// Inside content.js — look for Kintara's React/game state:
// Method 1: window.__kintara_state or window.gameState
// Method 2: Intercept WebSocket messages (Kintara likely uses WS for multiplayer)
// Method 3: MutationObserver on the player HUD (Lvl XX label is in the DOM)
```

The player's level and name are visible in the Kintara DOM (the `Lvl XX` / `000` labels in screenshots). A MutationObserver on these elements can extract `username` and `level` without any API.

**For avatar mirroring:** Kintara renders avatar outfit as CSS classes or inline SVG. Inspect the character sprite in DevTools to find the class pattern, then POST it to the companion's `/api/session` endpoint.

### Scraping approach (no official API)

```
content.js → reads DOM → POSTs to companion (localhost:3000) → /api/kintara/player
```

```ts
// Proposed endpoint: app/api/kintara/player/route.ts
// Stores last-known player state from extension scrape
// Club room polls this to show live "In the Club Now" with real Kintara data
```

### WebSocket interception (advanced, phase 2)

```js
// In content.js — monkey-patch WebSocket to intercept room state:
const OrigWS = window.WebSocket
window.WebSocket = function(url, protocols) {
  const ws = new OrigWS(url, protocols)
  ws.addEventListener('message', (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data.type === 'room_state' || data.players) {
        chrome.runtime.sendMessage({ type: 'KINTARA_ROOM', payload: data })
      }
    } catch (_) {}
  })
  return ws
}
```

---

## File Map

```
components/
  DegenClubRoom.tsx     ← MAIN TARGET: isometric scene + all panels
  KingCrabClubConcept.tsx  ← older concept, leave untouched
  
app/
  page.tsx              ← renders DegenClubRoom
  globals.css           ← Space Grotesk + Space Mono imported here
  
extension/
  content.js            ← Kintara DOM scraper (inject + read + POST)
  background.js         ← extension service worker
  
lib/
  kintaraApi.ts         ← market listings fetch (CORS-blocked without proxy)
  tokenApi.ts           ← DexScreener $KINS price
```

---

## Priority task list

1. `npm install framer-motion` → add to package.json
2. In `DegenClubRoom.tsx`: add dance floor tile pulse (staggered AnimatePresence motion.g wrappers)
3. Add stage light sweep animation (motion.polygon rotate)
4. Add queue item enter/exit animation (AnimatePresence)
5. Add avatar tile hover highlight (SVG diamond glow on mouseenter)
6. Sort avatars by Y coordinate before render
7. Fix the "KING CRAB CLUB" neon sign in SVG — needs CSS filter for actual glow, not just text-shadow (text-shadow doesn't work on SVG text without a foreign object)
8. Replace the restroom sign emoji with actual pixel-art style SVG male/female icons (matching voxel aesthetic)
9. Polish: `--border` should be `rgba(130,100,220,0.22)` everywhere — audit for any leftover gray borders
10. Responsive: ensure the iso scene scales correctly down to 1280px width (it currently uses `viewBox="0 0 1000 700"` with `preserveAspectRatio="xMidYMid slice"` which is correct — verify it doesn't clip panels)

---

## The vibe test

Before shipping any visual change: open the target reference (`kcc-target.png`) side by side.
Ask: **does this feel like the same world?**

The bar: a Kintara player opening this companion should feel like they're looking at a digital twin of the game's nightclub, not a dashboard that *references* it. The dance floor should pulse like it does in-game. The avatars should bob and feel alive. The neons should glow. The space should feel deep and dark, not flat.

If it looks like a SaaS dark mode — something is wrong.
