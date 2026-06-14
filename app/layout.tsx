import type { Metadata } from "next";
import Link from "next/link";
import { Gem, LayoutDashboard, ScrollText, Shield } from "lucide-react";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";
import { QueryProvider } from "./providers";

export const metadata: Metadata = {
  title: "Kintara Market Companion",
  description: "Read-only Kintara marketplace and KINS token dashboard.",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/market", label: "Market", icon: ScrollText },
  { href: "/account", label: "Account", icon: Shield },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="market-grid antialiased">
        <QueryProvider>
          <WalletProvider>
            <div className="min-h-screen">
              <header className="sticky top-0 z-40 border-b-2 bg-background/88 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                  <Link href="/" className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 bg-primary/12 text-primary shadow-glow">
                      <Gem className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        Kintara
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Market Companion
                      </span>
                    </span>
                  </Link>
                  <nav className="flex shrink-0 items-center gap-1 rounded-lg border-2 bg-card/76 p-1 shadow-glow">
                    {navItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </header>
              <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
