export const featureFlags = {
  walletReadonly: process.env.NEXT_PUBLIC_ENABLE_WALLET_READONLY !== "false",
  kintaraAuth: process.env.NEXT_PUBLIC_ENABLE_KINTARA_AUTH === "true",
  marketplaceWrites: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE_WRITES === "true",
  tokenPurchases: process.env.NEXT_PUBLIC_ENABLE_TOKEN_PURCHASES === "true",
  integrationMode:
    (process.env.KINTARA_INTEGRATION_MODE as
      | "disabled"
      | "mock"
      | "staging"
      | "production"
      | undefined) ?? "mock",
};

export function assertNoMarketplaceWritesEnabled() {
  return !featureFlags.marketplaceWrites && !featureFlags.tokenPurchases;
}

export function isMockIntegrationMode() {
  return featureFlags.integrationMode === "mock";
}
