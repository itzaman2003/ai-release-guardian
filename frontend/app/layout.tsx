import type { Metadata } from "next";
import { Activity, BarChart3, GitPullRequest, ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Release Guardian",
  description: "AI-powered release risk dashboard for GitHub pull requests",
};

const navItems = [
  { label: "Dashboard", icon: BarChart3, href: "#dashboard" },
  { label: "Analyze PR", icon: GitPullRequest, href: "#analyze-pr" },
  { label: "Quality Gate", icon: ShieldCheck, href: "#quality-gate" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card px-5 py-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Release Guardian</p>
                <p className="text-xs text-muted-foreground">Developer 2 Dashboard</p>
              </div>
            </div>
            <nav className="mt-8 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          <main className="lg:pl-64">
            <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold">Release Risk Command Center</h1>
                  <p className="text-sm text-muted-foreground">PR analysis, risk scoring, tests, notes, and CI/CD gate.</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Day 1 mock contract
                </span>
              </div>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
