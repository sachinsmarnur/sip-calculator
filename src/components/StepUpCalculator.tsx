"use client";

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
import { calculateStepUpSIP, calculateTax } from "@/utils/calculations";
import { TaxToggle } from "./TaxToggle";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExplanationSection } from "./ExplanationSection";
import { ResultStat } from "./ResultCard";
import { SliderInput } from "./SliderInput";
import { DownloadPDFButton } from "./DownloadPDFButton";
import { exportStepUpPDF } from "@/utils/pdfExport";

export function StepUpCalculator() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [monthly, setMonthly] = useLocalStorage("stepup-monthly", 10000);
  const [stepUp, setStepUp] = useLocalStorage("stepup-percent", 10);
  const [returnRate, setReturnRate] = useLocalStorage("stepup-returnRate", 12);
  const [years, setYears] = useLocalStorage("stepup-years", 15);
  const [adjustForInflation, setAdjustForInflation] = useLocalStorage("stepup-adjustForInflation", false);
  const [inflationRate, setInflationRate] = useLocalStorage("stepup-inflationRate", 6);
  const [applyTax, setApplyTax] = useLocalStorage("stepup-applyTax", false);
  const [fundType, setFundType] = useLocalStorage<"equity" | "debt">("stepup-fundType", "equity");
  const [taxSlab, setTaxSlab] = useLocalStorage("stepup-taxSlab", 30);

  const result = useMemo(
    () => calculateStepUpSIP(monthly, stepUp, returnRate, years, adjustForInflation ? inflationRate : null),
    [monthly, stepUp, returnRate, years, adjustForInflation, inflationRate],
  );

  const taxResult = useMemo(() => {
    if (!applyTax) return null;
    return calculateTax(result.estimatedReturns, result.maturityValue, fundType, years, taxSlab);
  }, [applyTax, result.estimatedReturns, result.maturityValue, fundType, years, taxSlab]);

  const chartData = result.yearlyBreakdown.map((d) => ({
    year: `Y${d.year}`,
    Invested: d.invested,
    Returns: d.returns,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
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

  // Calculate the final year SIP amount for display
  const finalYearSIP = result.yearlyBreakdown.length > 0
    ? result.yearlyBreakdown[result.yearlyBreakdown.length - 1].sipAmount
    : monthly;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.45_0.15_280)] to-[oklch(0.55_0.18_310)] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">
              SIP Step-Up Calculator
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Increase your SIP every year and see the power of accelerated
              compounding
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Annual Step-Up
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Step-Up Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderInput
              label="Starting Monthly SIP"
              value={monthly}
              onChange={setMonthly}
              min={500}
              max={100000}
              step={500}
              prefix={currencySymbol}
              inputId="stepup-monthly"
              ocidInput="stepup.monthly_input"
            />
            <SliderInput
              label="Annual Step-Up"
              value={stepUp}
              onChange={setStepUp}
              min={1}
              max={50}
              step={1}
              suffix="%"
              inputId="stepup-percent"
              ocidInput="stepup.stepup_input"
            />
            <SliderInput
              label="Expected Annual Return"
              value={returnRate}
              onChange={setReturnRate}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              inputId="stepup-return"
              ocidInput="stepup.return_input"
            />
            <SliderInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" yr"
              inputId="stepup-period"
              ocidInput="stepup.period_input"
            />

            {/* Inflation Toggle */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="stepup-inflation-toggle"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Adjust for Inflation
                </Label>
                <Switch
                  id="stepup-inflation-toggle"
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
                  inputId="stepup-inflation"
                  ocidInput="stepup.inflation_input"
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
          data-ocid="stepup.result_card"
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="font-display text-lg">
                Step-Up Growth Projection
              </CardTitle>
              <DownloadPDFButton
                onExport={() =>
                  exportStepUpPDF({
                    monthly,
                    stepUp,
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
                    finalYearSIP,
                    yearlyBreakdown: result.yearlyBreakdown,
                    currencySymbol,
                    formatCurrency,
                  })
                }
              />
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

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorStepInvested"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorStepReturns"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#06b6d4"
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
                  <Tooltip content={<CustomTooltip />} />
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
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorStepInvested)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Returns"
                    stackId="1"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#colorStepReturns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Starting SIP
                </p>
                <p className="text-lg font-bold font-display" style={{ color: "#8b5cf6" }}>
                  {currencySymbol}{monthly.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Final Year SIP
                </p>
                <p className="text-lg font-bold font-display" style={{ color: "#06b6d4" }}>
                  {currencySymbol}{finalYearSIP.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Wealth Ratio
                </p>
                <p className="text-lg font-bold font-display text-primary">
                  {(result.maturityValue / result.totalInvested).toFixed(2)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Breakdown with SIP amounts */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            Year-by-Year Step-Up Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-72">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold text-right">
                    Monthly SIP
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Cum. Invested
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Cum. Returns
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
                    <TableCell className="text-right font-medium" style={{ color: "#8b5cf6" }}>
                      {currencySymbol}{row.sipAmount.toLocaleString("en-IN")}
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
      <ExplanationSection title="What is SIP Step-Up? — Full Explanation">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">
              📌 What is SIP Step-Up?
            </h4>
            <p>
              A <strong>Step-Up SIP</strong> (also called a Top-Up SIP) is where
              you increase your monthly SIP amount by a fixed percentage every
              year. For example, if you start with {currencySymbol}10,000/month and step up by
              10% annually, your SIP becomes {currencySymbol}11,000 in Year 2, {currencySymbol}12,100 in Year
              3, and so on. This aligns with salary increments and significantly
              boosts your final corpus.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">🧮 How It Works</h4>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
              <p>Year N SIP = Initial SIP × (1 + Step-Up%)^(N-1)</p>
              <p>Each year's contribution compounds at the monthly return rate</p>
              <p>Final Corpus = Sum of all year-wise SIP future values</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              📊 Your Step-Up Impact
            </h4>
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-4 text-sm space-y-2">
              <p>
                Starting SIP: <strong>{currencySymbol}{monthly.toLocaleString("en-IN")}/month</strong>
              </p>
              <p>
                Annual Increase: <strong>{stepUp}%</strong> → Final year SIP:{" "}
                <strong>{currencySymbol}{finalYearSIP.toLocaleString("en-IN")}/month</strong>
              </p>
              <p>
                SIP grew by{" "}
                <strong>{((finalYearSIP / monthly - 1) * 100).toFixed(0)}%</strong>{" "}
                over {years} years
              </p>
              <p>
                Total Invested:{" "}
                <strong>{formatCurrency(result.totalInvested)}</strong>
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
              <li>
                Even a 10% annual step-up can almost double your corpus vs
                regular SIP over 20 years
              </li>
              <li>
                Align your step-up % with expected salary increments (8–15% is
                common)
              </li>
              <li>
                Step-up SIP combats inflation — your real investment grows each
                year
              </li>
              <li>
                Most mutual fund platforms support automatic step-up SIP
                mandates
              </li>
            </ul>
          </div>
        </div>
      </ExplanationSection>
    </div>
  );
}
