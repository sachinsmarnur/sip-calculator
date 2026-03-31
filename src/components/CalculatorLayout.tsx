import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { PiggyBank, Target, TrendingUp, Wallet, ArrowUpCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencyToggle } from "./CurrencyToggle";
import { FAQSection } from "./FAQSection";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const navItems = [
  { 
    path: "/sip-calculator", 
    label: "SIP", 
    icon: TrendingUp, 
    shortLabel: "SIP", 
    title: "SIP Calculator with Inflation Adjustment & Multi-Currency",
    description: "Calculate real returns with our advanced SIP calculator with inflation adjustment. Plan your monthly systematic investment plan with multi-currency support and growth charts."
  },
  { 
    path: "/step-up-calculator", 
    label: "Step-Up", 
    icon: ArrowUpCircle, 
    shortLabel: "Step", 
    title: "Step-Up SIP Calculator for Wealth Growth & Compounding",
    description: "Maximize your future corpus with our Step-Up SIP calculator. See how a small annual increase in your monthly SIP can significantly boost your long-term wealth compounding."
  },
  { 
    path: "/lumpsum-calculator", 
    label: "Lump Sum", 
    icon: PiggyBank, 
    shortLabel: "Lump", 
    title: "Lump Sum Investment Calculator with Inflation & Growth",
    description: "Estimate the future value of your one-time investments with our Lump Sum calculator with inflation. Understand compounding growth for your fixed deposits and mutual funds."
  },
  { 
    path: "/goal-planner", 
    label: "Goal Plan", 
    icon: Target, 
    shortLabel: "Goal", 
    title: "Reverse Goal SIP Planner - Calculate Monthly Investment Needed",
    description: "Plan your financial goals with our Reverse Goal SIP Planner with inflation. Calculate exactly how much you need to invest monthly to reach your target retirement or purchase goal."
  },
  { 
    path: "/swp-calculator", 
    label: "SWP", 
    icon: Wallet, 
    shortLabel: "SWP", 
    title: "SWP Calculator with Inflation - Retirement Withdrawal Planner",
    description: "Estimate your regular monthly income with our SWP calculator with inflation adjustment. Plan your systematic withdrawals and manage your post-retirement balance."
  },
];

export function CalculatorLayout() {
  const location = useLocation();
  const year = new Date().getFullYear();

  useEffect(() => {
    const activeItem = navItems.find(item => item.path === location.pathname);
    if (activeItem) {
      document.title = activeItem.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', activeItem.description);
      }
      
      // Update OG description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', activeItem.description);
      }

      // Update OG title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', activeItem.title);
      }
    } else if (location.pathname === "/") {
      document.title = "Smart Investment Calculators – InvestCalc";
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </NavLink>
          ))}
        </div>

        <Outlet />

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
