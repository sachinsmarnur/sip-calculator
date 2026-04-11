import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateSIP, calculateTax } from "@/utils/calculations";
import { TaxToggle } from "./TaxToggle";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExplanationSection } from "./ExplanationSection";
import { ResultStat } from "./ResultCard";
import { SliderInput } from "./SliderInput";
import { DownloadPDFButton } from "./DownloadPDFButton";
import { exportSIPPDF } from "@/utils/pdfExport";

const CHART_COLORS = ["#2db38a", "#f0a843"];
const CHART_KEYS = ["invested", "returns"] as const;

export function SIPCalculator() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [monthly, setMonthly] = useLocalStorage("sip-monthly", 10000);
  const [returnRate, setReturnRate] = useLocalStorage("sip-returnRate", 12);
  const [years, setYears] = useLocalStorage("sip-years", 15);
  const [chartMode, setChartMode] = useLocalStorage<"pie" | "growth">("sip-chartMode", "pie");
  const [adjustForInflation, setAdjustForInflation] = useLocalStorage("sip-adjustForInflation", false);
  const [inflationRate, setInflationRate] = useLocalStorage("sip-inflationRate", 6);
  const [applyTax, setApplyTax] = useLocalStorage("sip-applyTax", false);
  const [fundType, setFundType] = useLocalStorage<"equity" | "debt">("sip-fundType", "equity");
  const [taxSlab, setTaxSlab] = useLocalStorage("sip-taxSlab", 30);

  const result = useMemo(
    () => calculateSIP(monthly, returnRate, years, adjustForInflation ? inflationRate : null),
    [monthly, returnRate, years, adjustForInflation, inflationRate],
  );

  const taxResult = useMemo(() => {
    if (!applyTax) return null;
    return calculateTax(result.estimatedReturns, result.maturityValue, fundType, years, taxSlab);
  }, [applyTax, result.estimatedReturns, result.maturityValue, fundType, years, taxSlab]);

  const pieData = [
    { name: "Invested", value: result.totalInvested, key: CHART_KEYS[0] },
    { name: "Returns", value: result.estimatedReturns, key: CHART_KEYS[1] },
  ];

  const areaData = result.yearlyBreakdown.map((d) => ({
    year: `Y${d.year}`,
    Invested: d.invested,
    Returns: d.returns,
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm space-y-1">
          <p className="font-semibold text-foreground">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value, true)}
            </p>
          ))}
          <p className="font-bold text-foreground border-t border-border pt-1">
            Total: {formatCurrency(total, true)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.38_0.12_160)] to-[oklch(0.48_0.15_175)] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">SIP Calculator</h2>
            <p className="text-white/70 text-sm mt-1">
              Systematic Investment Plan — Monthly investing for long-term
              wealth
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Compounding Monthly
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Investment Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderInput
              label="Monthly Investment"
              value={monthly}
              onChange={setMonthly}
              min={500}
              max={100000}
              step={500}
              prefix={currencySymbol}
              inputId="sip-monthly"
              ocidInput="sip.monthly_input"
            />
            <SliderInput
              label="Expected Annual Return"
              value={returnRate}
              onChange={setReturnRate}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              inputId="sip-return"
              ocidInput="sip.return_input"
            />
            <SliderInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" yr"
              inputId="sip-period"
              ocidInput="sip.period_input"
            />

            {/* Inflation Toggle */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="sip-inflation-toggle"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Adjust for Inflation
                </Label>
                <Switch
                  id="sip-inflation-toggle"
                  checked={adjustForInflation}
                  onCheckedChange={setAdjustForInflation}
                />
              </div>
              {adjustForInflation && (
                <SliderInput
                  label="Expected Inflation Rate"
                  value={inflationRate}
                  onChange={setInflationRate}
                  min={1}
                  max={15}
                  step={0.5}
                  suffix="%"
                  inputId="sip-inflation"
                  ocidInput="sip.inflation_input"
                />
              )}
            </div>

            <TaxToggle
              applyTax={applyTax}
              onApplyTaxChange={setApplyTax}
              fundType={fundType}
              onFundTypeChange={setFundType}
              taxSlab={taxSlab}
              onTaxSlabChange={setTaxSlab}
              years={years}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <Card
          className="lg:col-span-3 shadow-result"
          data-ocid="sip.result_card"
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="font-display text-lg">
                Projected Returns
              </CardTitle>
              <div className="flex items-center gap-2">
                <DownloadPDFButton
                  onExport={() =>
                    exportSIPPDF({
                      monthly,
                      returnRate,
                      years,
                      totalInvested: result.totalInvested,
                      estimatedReturns: result.estimatedReturns,
                      maturityValue: result.maturityValue,
                      inflationRate: adjustForInflation ? inflationRate : null,
                      inflationAdjustedMaturity: result.inflationAdjustedMaturity,
                      taxAmount: taxResult?.taxAmount,
                      postTaxMaturity: taxResult?.postTaxMaturity,
                      fundType: applyTax ? fundType : undefined,
                      taxSlab: applyTax ? taxSlab : undefined,
                      yearlyBreakdown: result.yearlyBreakdown,
                      currencySymbol,
                      formatCurrency,
                    })
                  }
                />
              {/* Chart mode toggle */}
              <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setChartMode("pie")}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    chartMode === "pie"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("growth")}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    chartMode === "growth"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Growth
                </button>
              </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <ResultStat
                label="Total Invested"
                value={formatCurrency(result.totalInvested, true)}
                numericValue={result.totalInvested}
              />
              <ResultStat
                label="Est. Returns"
                value={formatCurrency(result.estimatedReturns, true)}
                numericValue={result.estimatedReturns}
                color="green"
              />
              <ResultStat
                label="Maturity Value"
                value={formatCurrency(result.maturityValue, true)}
                numericValue={result.maturityValue}
                highlight
              />
            </div>

            {adjustForInflation && result.inflationAdjustedMaturity && (
              <div className="bg-muted border border-border/80 rounded-xl p-4 mb-6 text-center shadow-inner">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Inflation Adjusted Value
                </p>
                <p className="text-2xl font-bold font-display text-primary">
                  {formatCurrency(result.inflationAdjustedMaturity)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchasing power of your returns in today's money
                </p>
              </div>
            )}

            {taxResult && (
              <div className="bg-red-50/50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 opacity-10">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                </div>
                
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center justify-between">
                  Post-Tax Returns
                  <Badge variant="outline" className="bg-white/50 text-red-700 border-red-200 dark:bg-black/20 dark:text-red-400">
                    {fundType === "equity" ? (years >= 1 ? "LTCG" : "STCG") : "SLAB"}
                  </Badge>
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-1">Tax Amount Deducted</p>
                    <p className="font-semibold text-red-700 dark:text-red-300">
                      -{formatCurrency(taxResult.taxAmount, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-1">Effective Tax Rate</p>
                    <p className="font-semibold text-red-700 dark:text-red-300">
                      {taxResult.effectiveTaxRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-red-200/50 dark:border-red-900/50">
                  <p className="text-xs text-red-800/70 dark:text-red-200/70 uppercase tracking-wider font-semibold mb-1">
                    Post-Tax Maturity Value
                  </p>
                  <p className="text-2xl font-bold font-display text-red-700 dark:text-red-400">
                    {formatCurrency(taxResult.postTaxMaturity)}
                  </p>
                </div>
              </div>
            )}

            <div className="h-52">
              {chartMode === "pie" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={600}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={CHART_COLORS[pieData.indexOf(entry)]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs font-medium text-foreground">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="sipGrowthInvested"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2db38a"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2db38a"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="sipGrowthReturns"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f0a843"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f0a843"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.90 0.008 80)"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.ceil(years / 8)}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatCurrency(v, true)}
                      width={65}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs font-medium text-foreground">
                          {value}
                        </span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="Invested"
                      stackId="1"
                      stroke="#2db38a"
                      strokeWidth={2}
                      fill="url(#sipGrowthInvested)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Returns"
                      stackId="1"
                      stroke="#f0a843"
                      strokeWidth={2}
                      fill="url(#sipGrowthReturns)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Wealth Ratio
                </p>
                <p className="text-lg font-bold font-display text-primary">
                  {(result.maturityValue / result.totalInvested).toFixed(2)}x
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Return %</p>
                <p className="text-lg font-bold font-display text-chart-1">
                  {(
                    (result.estimatedReturns / result.totalInvested) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Breakdown */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            Year-by-Year Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-72">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold text-right">
                    Invested
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Returns
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Total Value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.yearlyBreakdown.map((row, i) => (
                  <TableRow
                    key={row.year}
                    className={i % 2 === 0 ? "" : "bg-muted/20"}
                  >
                    <TableCell className="font-medium">
                      Year {row.year}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(row.invested, true)}
                    </TableCell>
                    <TableCell className="text-right text-chart-1 font-medium">
                      {formatCurrency(row.returns, true)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(row.total, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Explanation */}
      <ExplanationSection title="What is SIP? — Full Explanation">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">📌 What is SIP?</h4>
            <p>
              A <strong>Systematic Investment Plan (SIP)</strong> allows you to
              invest a fixed amount in mutual funds at regular intervals
              (typically monthly). It leverages the power of{" "}
              <strong>rupee cost averaging</strong> and{" "}
              <strong>compounding</strong> to build wealth over time. Rather
              than trying to time the market, SIP ensures disciplined,
              consistent investing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">🧮 Formula</h4>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <p>FV = P × [((1 + r)ⁿ − 1) / r] × (1 + r)</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <strong>FV</strong> — Future Value (Maturity Amount)
              </li>
              <li>
                <strong>P</strong> — Monthly Investment Amount ({currencySymbol}
                {monthly.toLocaleString("en-IN")})
              </li>
              <li>
                <strong>r</strong> — Monthly interest rate = Annual Rate ÷ 12 ÷
                100 = {returnRate} ÷ 12 ÷ 100 ={" "}
                {(returnRate / 12 / 100).toFixed(5)}
              </li>
              <li>
                <strong>n</strong> — Total months = {years} × 12 = {years * 12}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              📊 Example with your inputs
            </h4>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-2">
              <p>
                Monthly SIP: <strong>{currencySymbol}{monthly.toLocaleString("en-IN")}</strong>
              </p>
              <p>
                Annual Return: <strong>{returnRate}%</strong> → Monthly Rate:{" "}
                <strong>{(returnRate / 12 / 100).toFixed(5)}</strong>
              </p>
              <p>
                Period:{" "}
                <strong>
                  {years} years ({years * 12} months)
                </strong>
              </p>
              <p>
                Total Invested:{" "}
                <strong>{formatCurrency(result.totalInvested)}</strong>
              </p>
              <p>
                Estimated Returns:{" "}
                <strong className="text-chart-1">
                  {formatCurrency(result.estimatedReturns)}
                </strong>
              </p>
              <p>
                Final Corpus:{" "}
                <strong className="text-primary">
                  {formatCurrency(result.maturityValue)}
                </strong>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">💡 Key Insights</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>SIP removes the need to predict market highs and lows</li>
              <li>
                Starting early dramatically increases your corpus due to
                compounding
              </li>
              <li>
                Even a small increase in return rate (e.g., 10% → 12%) creates a
                massive difference over 20+ years
              </li>
              <li>
                SIPs are ideal for long-term goals: retirement, education,
                buying a home
              </li>
            </ul>
          </div>
        </div>
      </ExplanationSection>
    </div>
  );
}
