import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const checklist = [
  "Kintara official auth method",
  "Session cookie/JWT/OAuth/SIWS details",
  "Wallet-to-account binding rules",
  "Inventory read endpoint",
  "Current-user listings endpoint",
  "Create listing endpoint",
  "Cancel listing endpoint",
  "Reserve listing endpoint",
  "Gold buy endpoint",
  "Token quote endpoint",
  "Token confirm endpoint",
  "CSRF requirements",
  "CORS policy",
  "Rate limits",
  "Staging/sandbox access",
  "Idempotency requirements",
  "Error codes",
  "Marketplace terms/permission",
];

export default function IntegrationChecklistPage() {
  return (
    <div className="space-y-6">
      <section className="kintara-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-primary">
              Official integration
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Kintara Integration Checklist
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Write features remain disabled until these answers are provided and reviewed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">Marketplace Writes Disabled</Badge>
            <Badge variant="outline">No Real Transactions</Badge>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Required Before Production Writes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {checklist.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border-2 bg-muted/25 p-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{index + 1}. {item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
