import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateSWP } from "@/utils/calculations";
import { formatMonths } from "@/utils/formatters";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExplanationSection } from "./ExplanationSection";
import { ResultStat } from "./ResultCard";
import { SliderInput } from "./SliderInput";

export function SWPCalculator() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [corpus, setCorpus] = useLocalStorage("swp-corpus", 5000000);
  const [withdrawal, setWithdrawal] = useLocalStorage("swp-withdrawal", 30000);
  const [returnRate, setReturnRate] = useLocalStorage("swp-returnRate", 10);
  const [years, setYears] = useLocalStorage("swp-years", 20);

  const result = useMemo(
    () => calculateSWP(corpus, withdrawal, returnRate, years),
    [corpus, withdrawal, returnRate, years],
  );

  const isExhausted = result.corpusExhaustedMonth !== null;

  // Build yearly chart data from monthly breakdown
  const chartData = useMemo(() => {
    const data: Array<{ year: string; Corpus: number }> = [
      { year: "Y0", Corpus: corpus },
    ];
    const byYear = new Map<number, number>();
    for (const m of result.monthlyBreakdown) {
      byYear.set(m.year, m.closingBalance);
    }
    for (let y = 1; y <= years; y++) {
      const val = byYear.get(y);
      data.push({
        year: `Y${y}`,
        Corpus: val !== undefined ? Math.max(0, val) : 0,
      });
    }
    return data;
  }, [result, corpus, years]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">
            {formatCurrency(payload[0].value, true)} remaining
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.40_0.12_270)] to-[oklch(0.50_0.14_255)] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">SWP Calculator</h2>
            <p className="text-white/70 text-sm mt-1">
              Systematic Withdrawal Plan — Plan your monthly income from
              investments
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Monthly Withdrawals
          </Badge>
        </div>
      </div>

      {/* Exhaustion Alert */}
      {isExhausted && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-destructive text-sm">
              Corpus Exhausted Early!
            </p>
            <p className="text-sm text-foreground/80 mt-0.5">
              At {currencySymbol}{withdrawal.toLocaleString("en-IN")}/month withdrawal, your
              corpus will be fully depleted in{" "}
              <strong>{formatMonths(result.corpusExhaustedMonth!)}</strong>.
              Consider reducing monthly withdrawal or increasing corpus.
            </p>
          </div>
        </div>
      )}

      {!isExhausted && (
        <div className="flex items-start gap-3 bg-chart-1/10 border border-chart-1/30 rounded-xl p-4">
          <CheckCircle2
            className="h-5 w-5 shrink-0 mt-0.5"
            style={{ color: "#2db38a" }}
          />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#2db38a" }}>
              Corpus Survives Full Period!
            </p>
            <p className="text-sm text-foreground/80 mt-0.5">
              Your corpus will last the full {years} years with{" "}
              <strong>{formatCurrency(result.remainingCorpus, true)}</strong>{" "}
              remaining at the end.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Withdrawal Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderInput
              label="Total Corpus"
              value={corpus}
              onChange={setCorpus}
              min={100000}
              max={50000000}
              step={100000}
              prefix={currencySymbol}
              inputId="swp-corpus"
              ocidInput="swp.corpus_input"
            />
            <SliderInput
              label="Monthly Withdrawal"
              value={withdrawal}
              onChange={setWithdrawal}
              min={1000}
              max={500000}
              step={1000}
              prefix={currencySymbol}
              inputId="swp-withdrawal"
              ocidInput="swp.withdrawal_input"
            />
            <SliderInput
              label="Expected Annual Return"
              value={returnRate}
              onChange={setReturnRate}
              min={1}
              max={20}
              step={0.5}
              suffix="%"
              inputId="swp-return"
              ocidInput="swp.return_input"
            />
            <SliderInput
              label="Withdrawal Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" yr"
              inputId="swp-period"
              ocidInput="swp.period_input"
            />
          </CardContent>
        </Card>

        <Card
          className="lg:col-span-3 shadow-result"
          data-ocid="swp.result_card"
        >
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Corpus Depletion Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <ResultStat
                label="Initial Corpus"
                value={formatCurrency(corpus, true)}
              />
              <ResultStat
                label="Total Withdrawn"
                value={formatCurrency(result.totalWithdrawn, true)}
                color="amber"
              />
              <ResultStat
                label="Remaining"
                value={
                  isExhausted ? `${currencySymbol}0` : formatCurrency(result.remainingCorpus, true)
                }
                color={isExhausted ? "default" : "green"}
              />
              <ResultStat
                label={isExhausted ? "Lasts" : "Full Period"}
                value={
                  isExhausted
                    ? formatMonths(result.corpusExhaustedMonth!)
                    : `${years} yrs`
                }
                highlight={!isExhausted}
              />
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorCorpus"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7c6af0" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#7c6af0"
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
                  {isExhausted && (
                    <ReferenceLine
                      x={`Y${Math.ceil((result.corpusExhaustedMonth ?? 0) / 12)}`}
                      stroke="#e05252"
                      strokeDasharray="4 2"
                      label={{
                        value: "Depleted",
                        fill: "#e05252",
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="Corpus"
                    stroke="#7c6af0"
                    strokeWidth={2.5}
                    fill="url(#colorCorpus)"
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Monthly Return Earned
                </p>
                <p
                  className="text-lg font-bold font-display"
                  style={{ color: "#7c6af0" }}
                >
                  {formatCurrency((corpus * returnRate) / 12 / 100, true)}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Net Monthly Drawdown
                </p>
                <p className="text-lg font-bold font-display text-destructive">
                  {formatCurrency(
                    Math.max(0, withdrawal - (corpus * returnRate) / 12 / 100),
                    true,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExplanationSection title="What is SWP? — Full Explanation">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">📌 What is SWP?</h4>
            <p>
              A <strong>Systematic Withdrawal Plan (SWP)</strong> is the
              opposite of SIP. Instead of investing monthly, you withdraw a
              fixed amount every month from your mutual fund corpus. The
              remaining amount continues to earn returns. SWP is perfect for{" "}
              <strong>
                retirees or anyone needing a regular income stream
              </strong>{" "}
              from their investments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              🧮 Formula (Month-by-Month)
            </h4>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
              <p>Monthly Growth = Opening Balance × (r / 12)</p>
              <p>Closing Balance = Opening Balance + Growth − Withdrawal</p>
              <p>where r = Annual Return Rate / 100</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              📊 Example with your inputs
            </h4>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-sm space-y-2">
              <p>
                Corpus: <strong>{currencySymbol}{corpus.toLocaleString("en-IN")}</strong>
              </p>
              <p>
                Monthly Withdrawal:{" "}
                <strong>{currencySymbol}{withdrawal.toLocaleString("en-IN")}</strong>
              </p>
              <p>
                Annual Return: <strong>{returnRate}%</strong> → Monthly:{" "}
                <strong>{(returnRate / 12).toFixed(2)}%</strong>
              </p>
              <p>
                Monthly return earned on corpus:{" "}
                <strong>{formatCurrency((corpus * returnRate) / 12 / 100)}</strong>
              </p>
              <p>
                Since withdrawal ({formatCurrency(withdrawal)}) is{" "}
                {withdrawal > (corpus * returnRate) / 12 / 100
                  ? "more than"
                  : "less than"}{" "}
                monthly return ({formatCurrency((corpus * returnRate) / 12 / 100)}),
                your corpus will{" "}
                <strong>
                  {withdrawal > (corpus * returnRate) / 12 / 100
                    ? "gradually deplete"
                    : "grow over time"}
                </strong>
                .
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">💡 When to Use SWP</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Post-retirement income planning</li>
              <li>
                When you need a regular monthly income without selling entire
                investment
              </li>
              <li>
                Tax-efficient: only the gains portion of each withdrawal is
                taxable (not the entire amount)
              </li>
              <li>
                More flexible than FDs — you can adjust withdrawal amount at any
                time
              </li>
              <li>
                The golden rule: keep withdrawal ≤ monthly returns to preserve
                corpus forever
              </li>
            </ul>
          </div>
        </div>
      </ExplanationSection>
    </div>
  );
}
