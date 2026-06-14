import { integrationMode } from "./featureGuards";
import { mockKintaraClient } from "./mockClient";

export function getKintaraOfficialClient() {
  if (integrationMode() === "mock") {
    return mockKintaraClient;
  }

  throw new Error("marketplace_writes_disabled");
}
