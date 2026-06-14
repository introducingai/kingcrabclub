import type { ItemMetricHistorySample, ItemMetrics } from "./types";

type ItemHistoryCacheState = {
  samplesByItemType: Map<string, ItemMetricHistorySample[]>;
};

const globalItemHistoryCache = globalThis as typeof globalThis & {
  __kintaraItemHistoryCache?: ItemHistoryCacheState;
};

const cache = (globalItemHistoryCache.__kintaraItemHistoryCache ??= {
  samplesByItemType: new Map(),
});

// TODO: Persist item metric history in Postgres or Redis for production.
// Serverless module memory is not reliable across cold starts, regions, or deploys.

function minuteBucket(value: string) {
  const date = new Date(value);

  date.setSeconds(0, 0);

  return date.toISOString();
}

function materiallyChanged(
  previous: ItemMetricHistorySample | undefined,
  next: ItemMetricHistorySample,
) {
  if (!previous) {
    return true;
  }

  return (
    previous.tokenFloorUnit !== next.tokenFloorUnit ||
    previous.goldFloorUnit !== next.goldFloorUnit ||
    previous.tokenListedValue !== next.tokenListedValue ||
    previous.goldListedValue !== next.goldListedValue ||
    previous.listedQuantity !== next.listedQuantity ||
    previous.activeListings !== next.activeListings
  );
}

export function appendItemHistorySample(metrics: ItemMetrics) {
  const sample: ItemMetricHistorySample = {
    itemType: metrics.itemType,
    capturedAt: minuteBucket(metrics.updatedAt),
    tokenFloorUnit: metrics.tokenFloorUnit,
    goldFloorUnit: metrics.goldFloorUnit,
    tokenListedValue: metrics.tokenListedValue,
    goldListedValue: metrics.goldListedValue,
    listedQuantity: metrics.listedQuantity,
    activeListings: metrics.activeListings,
  };
  const samples = cache.samplesByItemType.get(metrics.itemType) ?? [];
  const last = samples[samples.length - 1];

  if (last?.capturedAt === sample.capturedAt) {
    if (materiallyChanged(last, sample)) {
      samples[samples.length - 1] = sample;
    }
  } else if (materiallyChanged(last, sample)) {
    samples.push(sample);
  }

  cache.samplesByItemType.set(metrics.itemType, samples.slice(-500));

  return getItemHistory(metrics.itemType);
}

export function getItemHistory(itemType: string) {
  return cache.samplesByItemType.get(itemType) ?? [];
}
