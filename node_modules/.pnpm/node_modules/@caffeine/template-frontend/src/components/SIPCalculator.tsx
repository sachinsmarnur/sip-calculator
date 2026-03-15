import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateSIP } from "@/utils/calculations";
import { formatINR } from "@/utils/formatters";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ExplanationSection } from "./ExplanationSection";
import { ResultStat } from "./ResultCard";
import { SliderInput } from "./SliderInput";

const CHART_COLORS = ["#2db38a", "#f0a843"];
const CHART_KEYS = ["invested", "returns"] as const;

export function SIPCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(15);

  const result = useMemo(
    () => calculateSIP(monthly, returnRate, years),
    [monthly, returnRate, years],
  );

  const pieData = [
    { name: "Invested", value: result.totalInvested, key: CHART_KEYS[0] },
    { name: "Returns", value: result.estimatedReturns, key: CHART_KEYS[1] },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-muted-foreground">{formatINR(payload[0].value)}</p>
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
              prefix="₹"
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
          </CardContent>
        </Card>

        {/* Results */}
        <Card
          className="lg:col-span-3 shadow-result"
          data-ocid="sip.result_card"
        >
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Projected Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <ResultStat
                label="Total Invested"
                value={formatINR(result.totalInvested, true)}
              />
              <ResultStat
                label="Est. Returns"
                value={formatINR(result.estimatedReturns, true)}
                color="green"
              />
              <ResultStat
                label="Maturity Value"
                value={formatINR(result.maturityValue, true)}
                highlight
              />
            </div>

            <div className="h-52">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-medium text-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                      {formatINR(row.invested, true)}
                    </TableCell>
                    <TableCell className="text-right text-chart-1 font-medium">
                      {formatINR(row.returns, true)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatINR(row.total, true)}
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
                <strong>P</strong> — Monthly Investment Amount (₹
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
                Monthly SIP: <strong>₹{monthly.toLocaleString("en-IN")}</strong>
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
                <strong>{formatINR(result.totalInvested)}</strong>
              </p>
              <p>
                Estimated Returns:{" "}
                <strong className="text-chart-1">
                  {formatINR(result.estimatedReturns)}
                </strong>
              </p>
              <p>
                Final Corpus:{" "}
                <strong className="text-primary">
                  {formatINR(result.maturityValue)}
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
