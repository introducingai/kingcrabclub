"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  getLocalAlertRules,
  seedLocalAlertRules,
  type LocalAlertRule,
} from "@/lib/localAlerts";

export function AlertRulesPanel() {
  const [rules, setRules] = useState<LocalAlertRule[]>([]);

  useEffect(() => {
    setRules(seedLocalAlertRules());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alert Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border-2 bg-muted/25 p-4 text-sm text-muted-foreground">
          Local preview only. Delivery via email, Discord, push, webhooks, or
          background jobs is not implemented.
        </div>
        <div className="mt-4 space-y-3">
          {(rules.length ? rules : getLocalAlertRules()).map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between gap-3 rounded-lg border-2 bg-muted/25 p-3"
            >
              <span>{rule.label}</span>
              <Badge variant="outline">Disabled</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
