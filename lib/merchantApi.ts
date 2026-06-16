export type MerchantResource = {
  name: string;
  current: number;
  target: number;
  percent: number;
};

export type MerchantStatus = {
  isOutOfGold: boolean;
  resources: {
    wood: MerchantResource;
    stone: MerchantResource;
    coal: MerchantResource;
    cookedFish: MerchantResource;
  };
  avgFillPercent: number;
  estimatedReturnHours?: number;
  estimatedReturnAt?: string;
  fillCostUsd?: number;
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function pickNum(
  obj: Record<string, unknown>,
  keys: string[],
  fallback: number,
): number {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v.replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

function pickBool(obj: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    if (typeof obj[key] === "boolean") return obj[key] as boolean;
  }
  return false;
}

function makeRes(name: string, current: number, target: number): MerchantResource {
  return {
    name,
    current,
    target,
    percent: target > 0 ? Math.min(100, (current / target) * 100) : 0,
  };
}

export function normalizeMerchantStatus(raw: unknown): MerchantStatus {
  const r = asRecord(raw);
  // Unwrap common envelope shapes
  const d = asRecord(r.data ?? r.donations ?? r.resources ?? r.requirements ?? r);

  const woodCurrent   = pickNum(d, ["wood",       "Wood",       "woodCurrent",   "woodDonated"],   0);
  const woodTarget    = pickNum(d, ["woodTarget",  "woodRequired", "woodMax"],                    500_000);
  const stoneCurrent  = pickNum(d, ["stone",      "Stone",      "stoneCurrent",  "stoneDonated"],  0);
  const stoneTarget   = pickNum(d, ["stoneTarget", "stoneRequired", "stoneMax"],                  300_000);
  const coalCurrent   = pickNum(d, ["coal",        "Coal",       "coalCurrent",   "coalDonated"],   0);
  const coalTarget    = pickNum(d, ["coalTarget",  "coalRequired", "coalMax"],                    200_000);
  const fishCurrent   = pickNum(d, ["cookedFish",  "cooked_fish", "fish", "Fish", "fishCurrent", "fishDonated"], 0);
  const fishTarget    = pickNum(d, ["cookedFishTarget", "fishTarget", "fishMax"],                  10_000);

  const resources = {
    wood:      makeRes("Wood",        woodCurrent,  woodTarget),
    stone:     makeRes("Stone",       stoneCurrent, stoneTarget),
    coal:      makeRes("Coal",        coalCurrent,  coalTarget),
    cookedFish:makeRes("Cooked Fish", fishCurrent,  fishTarget),
  };

  const avgFillPercent =
    Object.values(resources).reduce((acc, res) => acc + res.percent, 0) / 4;

  const returnHours = pickNum(r, ["estimatedReturnHours", "returnHours", "hoursUntilReturn"], NaN);

  return {
    isOutOfGold:
      pickBool(r, ["isOutOfGold", "outOfGold", "out_of_gold", "goldDepleted"]) ||
      avgFillPercent < 100,
    resources,
    avgFillPercent,
    estimatedReturnHours: Number.isFinite(returnHours) ? returnHours : undefined,
    estimatedReturnAt:
      typeof r.estimatedReturnAt === "string" ? r.estimatedReturnAt : undefined,
    fillCostUsd: (() => {
      const v = pickNum(r, ["fillCostUsd", "fillPrice", "costUsd", "totalCostUsd"], NaN);
      return Number.isFinite(v) ? v : undefined;
    })(),
  };
}

export async function fetchMerchantStatus(): Promise<MerchantStatus> {
  const res = await fetch("/api/kintara/merchant");
  const payload = (await res.json()) as {
    ok: boolean;
    data?: unknown;
    error?: string;
  };

  if (!payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? "Merchant data unavailable");
  }

  return normalizeMerchantStatus(payload.data);
}
