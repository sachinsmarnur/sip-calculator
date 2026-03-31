import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { calculateLumpSum } from "@/utils/calculations";
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

export function LumpSumCalculator() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [amount, setAmount] = useLocalStorage("lumpsum-amount", 500000);
  const [returnRate, setReturnRate] = useLocalStorage("lumpsum-returnRate", 12);
  const [years, setYears] = useLocalStorage("lumpsum-years", 15);
  const [adjustForInflation, setAdjustForInflation] = useLocalStorage("lumpsum-adjustForInflation", false);
  const [inflationRate, setInflationRate] = useLocalStorage("lumpsum-inflationRate", 6);

  const result = useMemo(
    () => calculateLumpSum(amount, returnRate, years, adjustForInflation ? inflationRate : null),
    [amount, returnRate, years, adjustForInflation, inflationRate],
  );

  const chartData = result.yearlyGrowth.map((d) => ({
    year: `Y${d.year}`,
    Principal: d.invested,
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

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.55_0.16_75)] to-[oklch(0.65_0.14_55)] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Lump Sum Calculator
            </h2>
            <p className="text-white/70 text-sm mt-1">
              One-time investment growth with compound interest
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Compounding Annually
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Investment Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderInput
              label="Investment Amount"
              value={amount}
              onChange={setAmount}
              min={10000}
              max={10000000}
              step={10000}
              prefix={currencySymbol}
              inputId="ls-amount"
              ocidInput="lumpsum.amount_input"
            />
            <SliderInput
              label="Expected Annual Return"
              value={returnRate}
              onChange={setReturnRate}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              inputId="ls-return"
              ocidInput="lumpsum.return_input"
            />
            <SliderInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" yr"
              inputId="ls-period"
              ocidInput="lumpsum.period_input"
            />

            {/* Inflation Toggle */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="lumpsum-inflation-toggle"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Adjust for Inflation
                </Label>
                <Switch
                  id="lumpsum-inflation-toggle"
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
                  inputId="lumpsum-inflation"
                  ocidInput="lumpsum.inflation_input"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="lg:col-span-3 shadow-result"
          data-ocid="lumpsum.result_card"
        >
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Growth Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <ResultStat
                label="Principal"
                value={formatCurrency(result.principal, true)}
              />
              <ResultStat
                label="Est. Returns"
                value={formatCurrency(result.estimatedReturns, true)}
                color="amber"
              />
              <ResultStat
                label="Maturity Value"
                value={formatCurrency(result.maturityValue, true)}
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

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorPrincipal"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2db38a" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#2db38a"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorReturns"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f0a843" stopOpacity={0.4} />
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
                    dataKey="Principal"
                    stackId="1"
                    stroke="#2db38a"
                    strokeWidth={2}
                    fill="url(#colorPrincipal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Returns"
                    stackId="1"
                    stroke="#f0a843"
                    strokeWidth={2}
                    fill="url(#colorReturns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">CAGR</p>
                <p
                  className="text-lg font-bold font-display"
                  style={{ color: "#f0a843" }}
                >
                  {returnRate}% p.a.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Money Multiplied
                </p>
                <p className="text-lg font-bold font-display text-primary">
                  {(result.maturityValue / result.principal).toFixed(2)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExplanationSection title="What is Lump Sum Investment? — Full Explanation">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">
              📌 What is a Lump Sum Investment?
            </h4>
            <p>
              A <strong>lump sum investment</strong> means investing the entire
              amount at once, rather than in installments. Unlike SIP, you
              invest all your capital upfront and let it grow through{" "}
              <strong>compound interest</strong> over time. It's ideal when you
              receive a windfall — a bonus, inheritance, or proceeds from a
              property sale.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">🧮 Formula</h4>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <p>FV = PV × (1 + r/100)ⁿ</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <strong>FV</strong> — Future Value
              </li>
              <li>
                <strong>PV</strong> — Present Value / Principal ({currencySymbol}
                {amount.toLocaleString("en-IN")})
              </li>
              <li>
                <strong>r</strong> — Annual Return Rate = {returnRate}%
              </li>
              <li>
                <strong>n</strong> — Number of Years = {years}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              📊 Example with your inputs
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm space-y-2">
              <p>
                Investment: <strong>{currencySymbol}{amount.toLocaleString("en-IN")}</strong>
              </p>
              <p>
                Return Rate: <strong>{returnRate}% per annum</strong>
              </p>
              <p>
                Period: <strong>{years} years</strong>
              </p>
              <p>
                Calculation: {currencySymbol}{amount.toLocaleString("en-IN")} × (1 +{" "}
                {returnRate}/100)^{years}
              </p>
              <p>
                Maturity Value:{" "}
                <strong className="text-amber-700">
                  {formatCurrency(result.maturityValue)}
                </strong>
              </p>
              <p>
                Profit:{" "}
                <strong className="text-green-700">
                  {formatCurrency(result.estimatedReturns)}
                </strong>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">💡 SIP vs Lump Sum</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>
                Lump sum is better when markets are at a low (buy more units
                cheaply)
              </li>
              <li>
                SIP is better when you're unsure of market direction or don't
                have a large amount ready
              </li>
              <li>
                Both benefit equally from long holding periods due to
                compounding
              </li>
              <li>
                Diversify: use both strategies depending on your cash flows
              </li>
            </ul>
          </div>
        </div>
      </ExplanationSection>
    </div>
  );
}
