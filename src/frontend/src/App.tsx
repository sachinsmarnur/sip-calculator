import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { LumpSumCalculator } from "./components/LumpSumCalculator";
import { SIPCalculator } from "./components/SIPCalculator";
import { SWPCalculator } from "./components/SWPCalculator";

export default function App() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/60 bg-sidebar-accent px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              Live Calculations
            </span>
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
              Calculate returns for SIP, Lump Sum investments, and plan your
              retirement income with our SWP tool. All calculations use standard
              financial formulas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <Tabs defaultValue="sip">
          <TabsList className="mb-8 grid w-full grid-cols-3 h-auto p-1.5 bg-card border border-border shadow-card rounded-xl">
            <TabsTrigger
              value="sip"
              data-ocid="nav.sip_tab"
              className="flex items-center gap-2 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">SIP</span>
              <span className="sm:hidden">SIP</span>
            </TabsTrigger>
            <TabsTrigger
              value="lumpsum"
              data-ocid="nav.lumpsum_tab"
              className="flex items-center gap-2 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Lump Sum</span>
              <span className="sm:hidden">Lump</span>
            </TabsTrigger>
            <TabsTrigger
              value="swp"
              data-ocid="nav.swp_tab"
              className="flex items-center gap-2 py-3 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">SWP</span>
              <span className="sm:hidden">SWP</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip">
            <SIPCalculator />
          </TabsContent>
          <TabsContent value="lumpsum">
            <LumpSumCalculator />
          </TabsContent>
          <TabsContent value="swp">
            <SWPCalculator />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground/60 text-center">
            Calculations are for illustrative purposes. Actual returns may vary.
          </p>
        </div>
      </footer>
    </div>
  );
}
