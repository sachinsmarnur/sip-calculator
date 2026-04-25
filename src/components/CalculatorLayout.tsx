"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiggyBank, Target, TrendingUp, Wallet, ArrowUpCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencyToggle } from "./CurrencyToggle";
import { FAQSection } from "./FAQSection";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    label: "SIP",
    icon: TrendingUp,
    shortLabel: "SIP",
  },
  {
    path: "/step-up-calculator",
    label: "Step-Up",
    icon: ArrowUpCircle,
    shortLabel: "Step",
  },
  {
    path: "/lumpsum-calculator",
    label: "Lump Sum",
    icon: PiggyBank,
    shortLabel: "Lump",
  },
  {
    path: "/goal-planner",
    label: "Goal Plan",
    icon: Target,
    shortLabel: "Goal",
  },
  {
    path: "/swp-calculator",
    label: "SWP",
    icon: Wallet,
    shortLabel: "SWP",
  },
];

export function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-sidebar-foreground leading-none">
                InvestCalc
              </h1>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">
                Smart Investment Calculators
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/60 bg-sidebar-accent px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              Live Calculations
            </span>
            <CurrencyToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <div className="bg-gradient-to-b from-sidebar/10 to-transparent border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Plan Your Financial
              <span className="text-primary"> Future</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Calculate returns for SIP, Step-Up SIP, Lump Sum investments,
              plan goal-based investments, and manage retirement income with
              our SWP tool. All calculations use standard financial formulas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8 grid w-full grid-cols-5 h-auto p-1.5 bg-card border border-border shadow-card rounded-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>

        {children}

        <FAQSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {year}. Smart Investment Calculators
          </p>
          <p className="text-xs text-muted-foreground/60 text-center">
            Calculations are for illustrative purposes. Read all the related documents carefully before investing.
          </p>
        </div>
      </footer>
    </div>
  );
}
