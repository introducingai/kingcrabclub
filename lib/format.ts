export function formatNumber(value?: number, maximumFractionDigits = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatCompact(value?: number, maximumFractionDigits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(value);
}

export function formatUsd(value?: number, maximumFractionDigits = 6) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

export function formatMarketPrice(value?: number, currency?: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  const suffix = currency === "token" ? "KINS" : currency ?? "gold";

  return `${formatNumber(value, value < 1 ? 4 : 2)} ${suffix}`;
}

export function formatUsdKins(value?: number, maximumFractionDigits = 4) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return `${formatUsd(value, maximumFractionDigits)} KINS`;
}

export function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function shortAddress(value?: string) {
  if (!value) {
    return "Unknown";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 5)}...${value.slice(-4)}`;
}

export function formatRelativeSeconds(value?: string | number) {
  if (!value) {
    return "never";
  }

  const timestamp = typeof value === "number" ? value : new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "never";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 1) {
    return "just now";
  }

  if (seconds === 1) {
    return "1 second ago";
  }

  return `${seconds} seconds ago`;
}
