export type LocalAlertType =
  | "item_floor_below"
  | "item_listed_token"
  | "item_listed_gold"
  | "seller_lists"
  | "new_floor";

export type LocalAlertRule = {
  id: string;
  type: LocalAlertType;
  label: string;
  enabled: false;
  createdAt: string;
  payload?: Record<string, unknown>;
};

const ALERT_RULES_KEY = "kintara.local-alert-rules.v1";

function readRules() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(ALERT_RULES_KEY) ?? "[]") as LocalAlertRule[];
  } catch {
    return [];
  }
}

function writeRules(rules: LocalAlertRule[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules));
}

export function getLocalAlertRules() {
  return readRules();
}

export function seedLocalAlertRules() {
  const existing = readRules();

  if (existing.length > 0) {
    return existing;
  }

  const now = new Date().toISOString();
  const rules: LocalAlertRule[] = [
    { id: "item_floor_below", type: "item_floor_below", label: "Item floor below X", enabled: false, createdAt: now },
    { id: "item_listed_token", type: "item_listed_token", label: "Item listed in token", enabled: false, createdAt: now },
    { id: "item_listed_gold", type: "item_listed_gold", label: "Item listed in gold", enabled: false, createdAt: now },
    { id: "seller_lists", type: "seller_lists", label: "Seller lists something", enabled: false, createdAt: now },
    { id: "new_floor", type: "new_floor", label: "New floor appears", enabled: false, createdAt: now },
  ];

  writeRules(rules);

  return rules;
}
