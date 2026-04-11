import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { calculateGoalSIP } from "@/utils/calculations";
import { formatMonths } from "@/utils/formatters";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Target, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
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
import { DownloadPDFButton } from "./DownloadPDFButton";
import { exportGoalPDF } from "@/utils/pdfExport";

const CHART_COLORS = ["#f97316", "#06b6d4"];

export function GoalPlannerCalculator() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [targetAmount, setTargetAmount] = useLocalStorage("goal-targetAmount", 10000000); // 1 Crore
  const [returnRate, setReturnRate] = useLocalStorage("goal-returnRate", 12);
  const [years, setYears] = useLocalStorage("goal-years", 15);
  const [adjustForInflation, setAdjustForInflation] = useLocalStorage("goal-adjustForInflation", false);
  const [inflationRate, setInflationRate] = useLocalStorage("goal-inflationRate", 6);

  const result = useMemo(
    () =>
      calculateGoalSIP(
        targetAmount,
        returnRate,
        years,
        adjustForInflation ? inflationRate : null,
      ),
    [targetAmount, returnRate, years, adjustForInflation, inflationRate],
  );

  const effectiveTarget =
    result.inflationAdjustedTarget ?? result.targetAmount;

  const pieData = [
    { name: "You Invest", value: result.totalInvested, key: "invested" },
    { name: "Market Returns", value: result.estimatedReturns, key: "returns" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
          {payload.map((p: any) => (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
              <p className="font-semibold">{payload[0].name}</p>
              <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
            </div>
          ))}
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.50_0.16_30)] to-[oklch(0.60_0.18_50)] p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Goal-Based SIP Planner
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Set your target amount and find out how much you need to invest
              monthly
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Target className="h-3.5 w-3.5 mr-1" />
            Reverse Calculator
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Goal Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderInput
              label="Target Amount"
              value={targetAmount}
              onChange={setTargetAmount}
              min={100000}
              max={100000000}
              step={100000}
              prefix={currencySymbol}
              inputId="goal-target"
              ocidInput="goal.target_input"
            />
            <SliderInput
              label="Expected Annual Return"
              value={returnRate}
              onChange={setReturnRate}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              inputId="goal-return"
              ocidInput="goal.return_input"
            />
            <SliderInput
              label="Time to Goal"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" yr"
              inputId="goal-period"
              ocidInput="goal.period_input"
            />

            {/* Inflation Toggle */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="inflation-toggle"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Adjust for Inflation
                </Label>
                <Switch
                  id="inflation-toggle"
                  checked={adjustForInflation}
                  onCheckedChange={setAdjustForInflation}
                />
              </div>
              {adjustForInflation && (
                <SliderInput
                  label="Inflation Rate"
                  value={inflationRate}
                  onChange={setInflationRate}
                  min={1}
                  max={15}
                  step={0.5}
                  suffix="%"
                  inputId="goal-inflation"
                  ocidInput="goal.inflation_input"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card
          className="lg:col-span-3 shadow-result"
          data-ocid="goal.result_card"
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="font-display text-lg">
                Your SIP Plan
              </CardTitle>
              <DownloadPDFButton
                onExport={() =>
                  exportGoalPDF({
                    targetAmount,
                    returnRate,
                    years,
                    requiredMonthlySIP: result.requiredMonthlySIP,
                    totalInvested: result.totalInvested,
                    estimatedReturns: result.estimatedReturns,
                    inflationRate: adjustForInflation ? inflationRate : null,
                    inflationAdjustedTarget: result.inflationAdjustedTarget,
                    milestones: result.milestones,
                    currencySymbol,
                    formatCurrency,
                    formatMonths,
                  })
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-50 to-cyan-50 dark:from-orange-950/30 dark:to-cyan-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl p-5 mb-5 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Required Monthly SIP
              </p>
              <p className="text-3xl font-bold font-display text-orange-600 dark:text-orange-400">
                {formatCurrency(result.requiredMonthlySIP)}
              </p>
              {result.inflationAdjustedTarget && (
                <p className="text-xs text-muted-foreground mt-2">
                  Inflation-adjusted target:{" "}
                  <strong>{formatCurrency(result.inflationAdjustedTarget, true)}</strong>{" "}
                  (from {formatCurrency(targetAmount, true)})
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <ResultStat
                label="Total Invested"
                value={formatCurrency(result.totalInvested, true)}
                numericValue={result.totalInvested}
              />
              <ResultStat
                label="Market Returns"
                value={formatCurrency(result.estimatedReturns, true)}
                numericValue={result.estimatedReturns}
                color="green"
              />
              <ResultStat
                label="Goal Amount"
                value={formatCurrency(effectiveTarget, true)}
                numericValue={effectiveTarget}
                highlight
              />
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={600}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.key}
                        fill={CHART_COLORS[index]}
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

            {/* Milestones */}
            {result.milestones.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Goal Milestones
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => {
                    const milestone = result.milestones.find(
                      (m) => m.percent === pct,
                    );
                    return (
                      <div
                        key={pct}
                        className={`rounded-lg p-2.5 text-center border transition-all ${
                          milestone
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/40 border-border/50 opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {milestone && (
                            <CheckCircle2
                              className="h-3 w-3 text-primary"
                            />
                          )}
                          <span className="text-xs font-bold text-primary">
                            {pct}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {milestone
                            ? formatMonths(milestone.month)
                            : "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <ExplanationSection title="Goal-Based Investing — Full Explanation">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-base mb-2">
              📌 What is Goal-Based SIP?
            </h4>
            <p>
              Instead of deciding how much to invest, you start with{" "}
              <strong>how much you need</strong> and work backwards. Whether
              it's ₹1 Crore for retirement, ₹50 Lakhs for a home down payment,
              or ₹25 Lakhs for your child's education — this calculator tells
              you the exact monthly SIP needed.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">🧮 Formula</h4>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <p>P = FV ÷ [((1 + r)ⁿ − 1) / r × (1 + r)]</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <strong>P</strong> — Required Monthly SIP
              </li>
              <li>
                <strong>FV</strong> — Target Amount (
                {formatCurrency(effectiveTarget, true)})
              </li>
              <li>
                <strong>r</strong> — Monthly rate = {returnRate}% ÷ 12 ÷ 100 ={" "}
                {(returnRate / 12 / 100).toFixed(5)}
              </li>
              <li>
                <strong>n</strong> — Total months = {years} × 12 = {years * 12}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              📊 Your Goal Plan
            </h4>
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-sm space-y-2">
              <p>
                Target: <strong>{formatCurrency(targetAmount)}</strong>
                {result.inflationAdjustedTarget && (
                  <span>
                    {" "}→ Inflation-adjusted:{" "}
                    <strong>{formatCurrency(result.inflationAdjustedTarget)}</strong>
                  </span>
                )}
              </p>
              <p>
                Required SIP:{" "}
                <strong className="text-orange-600">
                  {formatCurrency(result.requiredMonthlySIP)}/month
                </strong>
              </p>
              <p>
                Over {years} years, you'll invest{" "}
                <strong>{formatCurrency(result.totalInvested)}</strong> and the market
                adds <strong className="text-chart-1">{formatCurrency(result.estimatedReturns)}</strong>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">
              💡 Pro Tips
            </h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>
                Always account for inflation — ₹1 Crore today is worth much
                less in 20 years
              </li>
              <li>
                Start early: the same goal requires 3× more SIP if you start
                10 years later
              </li>
              <li>
                Use step-up SIP to make achieving ambitious goals more
                manageable
              </li>
              <li>
                Review your goals annually and adjust SIP amounts
              </li>
            </ul>
          </div>
        </div>
      </ExplanationSection>
    </div>
  );
}
