"use client";

import Link from "next/link";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { AlertRulesPanel } from "@/components/AlertRulesPanel";
import { MockOfficialIntegrationPanel } from "@/components/MockOfficialIntegrationPanel";
import { SavedSearchesPanel } from "@/components/SavedSearchesPanel";
import { WalletConnectPanel } from "@/components/WalletConnectPanel";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featureFlags } from "@/lib/featureFlags";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <section className="kintara-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-primary">Account</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Read-only account mode
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Connect a wallet for public display and read-only Solana data. Direct
              buy/sell is disabled until Kintara provides official auth and marketplace
              write access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">No signatures</Badge>
            <Badge variant="outline">No approvals</Badge>
            <Badge variant="outline">No inventory writes</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <WalletConnectPanel />
        <ReadOnlyStatusCard />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <WatchlistPanel />
        <SavedSearchesPanel />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AlertRulesPanel />
        <IntegrationChecklist />
      </section>

      <MockOfficialIntegrationPanel />
    </div>
  );
}

function ReadOnlyStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Safety Status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <FlagRow label="Wallet read-only" enabled={featureFlags.walletReadonly} />
        <FlagRow label="Kintara auth" enabled={featureFlags.kintaraAuth} inverted />
        <FlagRow label="Marketplace writes" enabled={featureFlags.marketplaceWrites} inverted />
        <FlagRow label="Token purchases" enabled={featureFlags.tokenPurchases} inverted />
        <div className="sm:col-span-2 rounded-lg border-2 bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
          Wallet connect never asks for private keys, message signatures, token approvals,
          transaction signatures, or Kintara inventory permissions.
        </div>
      </CardContent>
    </Card>
  );
}

function FlagRow({
  label,
  enabled,
  inverted,
}: {
  label: string;
  enabled: boolean;
  inverted?: boolean;
}) {
  const safe = inverted ? !enabled : enabled;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 p-3">
      <span className="text-sm font-semibold">{label}</span>
      <Badge variant={safe ? "secondary" : "destructive"}>{safe ? "Safe" : "Disabled"}</Badge>
    </div>
  );
}

function IntegrationChecklist() {
  const items = [
    "Official Kintara API access",
    "Same-origin or approved CORS deployment",
    "Auth boundary review",
    "Wallet transaction safety review",
    "Terms and marketplace write approval",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-primary" />
          Official Integration Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-lg border-2 bg-muted/25 p-3">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
        <div className="rounded-lg border-2 border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          Direct buy/sell is disabled until Kintara provides official auth and
          marketplace write access.
        </div>
        <Link
          href="/account/integration-checklist"
          className="inline-flex h-10 items-center justify-center rounded-md border-2 bg-muted px-4 text-sm font-semibold transition hover:bg-muted/80"
        >
          Open full checklist
        </Link>
      </CardContent>
    </Card>
  );
}
