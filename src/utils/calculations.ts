export interface SIPResult {
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationAdjustedMaturity: number | null;
  yearlyBreakdown: YearlyData[];
}

export interface YearlyData {
  year: number;
  invested: number;
  returns: number;
  total: number;
}

export interface LumpSumResult {
  principal: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationAdjustedMaturity: number | null;
  yearlyGrowth: YearlyData[];
}

export interface SWPResult {
  totalWithdrawn: number;
  remainingCorpus: number;
  corpusExhaustedMonth: number | null; // null = lasts full period
  monthlyBreakdown: SWPMonthlyData[];
}

export interface SWPMonthlyData {
  month: number;
  year: number;
  openingBalance: number;
  withdrawal: number;
  growth: number;
  closingBalance: number;
}

export function calculateInflationDiscountedValue(fv: number, inflationRate: number, years: number): number {
  return fv / (1 + inflationRate / 100) ** years;
}

export function calculateSIP(
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
  inflationRate: number | null = null,
): SIPResult {
  const r = annualReturn / 12 / 100;
  const n = years * 12;
  const maturityValue = monthlyInvestment * (((1 + r) ** n - 1) / r) * (1 + r);
  const totalInvested = monthlyInvestment * n;
  const estimatedReturns = maturityValue - totalInvested;
  
  const inflationAdjustedMaturity = inflationRate !== null 
    ? calculateInflationDiscountedValue(maturityValue, inflationRate, years)
    : null;

  const yearlyBreakdown: YearlyData[] = [];
  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const fv = monthlyInvestment * (((1 + r) ** months - 1) / r) * (1 + r);
    const inv = monthlyInvestment * months;
    yearlyBreakdown.push({
      year: y,
      invested: inv,
      returns: fv - inv,
      total: fv,
    });
  }

  return { totalInvested, estimatedReturns, maturityValue, inflationAdjustedMaturity, yearlyBreakdown };
}

export function calculateLumpSum(
  principal: number,
  annualReturn: number,
  years: number,
  inflationRate: number | null = null,
): LumpSumResult {
  const maturityValue = principal * (1 + annualReturn / 100) ** years;
  const estimatedReturns = maturityValue - principal;

  const inflationAdjustedMaturity = inflationRate !== null 
    ? calculateInflationDiscountedValue(maturityValue, inflationRate, years)
    : null;

  const yearlyGrowth: YearlyData[] = [];
  for (let y = 1; y <= years; y++) {
    const fv = principal * (1 + annualReturn / 100) ** y;
    yearlyGrowth.push({
      year: y,
      invested: principal,
      returns: fv - principal,
      total: fv,
    });
  }

  return { principal, estimatedReturns, maturityValue, inflationAdjustedMaturity, yearlyGrowth };
}

// --- Step-Up SIP ---

export interface StepUpSIPResult {
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationAdjustedMaturity: number | null;
  yearlyBreakdown: StepUpYearlyData[];
}

export interface StepUpYearlyData {
  year: number;
  sipAmount: number; // monthly SIP for that year
  invested: number; // cumulative invested
  returns: number; // cumulative returns
  total: number; // cumulative value
}

export function calculateStepUpSIP(
  initialMonthly: number,
  annualStepUp: number, // percentage e.g. 10 for 10%
  annualReturn: number,
  years: number,
  inflationRate: number | null = null,
): StepUpSIPResult {
  const r = annualReturn / 12 / 100;
  let totalInvested = 0;
  let corpusValue = 0;
  const yearlyBreakdown: StepUpYearlyData[] = [];

  for (let y = 1; y <= years; y++) {
    const currentMonthly =
      initialMonthly * (1 + annualStepUp / 100) ** (y - 1);

    for (let m = 1; m <= 12; m++) {
      corpusValue = (corpusValue + currentMonthly) * (1 + r);
      totalInvested += currentMonthly;
    }

    yearlyBreakdown.push({
      year: y,
      sipAmount: Math.round(currentMonthly),
      invested: totalInvested,
      returns: corpusValue - totalInvested,
      total: corpusValue,
    });
  }

  const inflationAdjustedMaturity = inflationRate !== null 
    ? calculateInflationDiscountedValue(corpusValue, inflationRate, years)
    : null;

  return {
    totalInvested,
    estimatedReturns: corpusValue - totalInvested,
    maturityValue: corpusValue,
    inflationAdjustedMaturity,
    yearlyBreakdown,
  };
}

// --- Goal-Based SIP ---

export interface GoalSIPResult {
  requiredMonthlySIP: number;
  totalInvested: number;
  estimatedReturns: number;
  targetAmount: number;
  inflationAdjustedTarget: number | null;
  yearlyBreakdown: YearlyData[];
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  percent: number; // 25, 50, 75, 100
  year: number;
  month: number;
}

export function calculateInflationAdjustedGoal(
  targetAmount: number,
  inflationRate: number,
  years: number,
): number {
  return targetAmount * (1 + inflationRate / 100) ** years;
}

export function calculateGoalSIP(
  targetAmount: number,
  annualReturn: number,
  years: number,
  inflationRate: number | null = null,
): GoalSIPResult {
  const adjustedTarget =
    inflationRate !== null
      ? calculateInflationAdjustedGoal(targetAmount, inflationRate, years)
      : targetAmount;

  const r = annualReturn / 12 / 100;
  const n = years * 12;
  // Reverse SIP formula: P = FV / [((1+r)^n - 1) / r * (1+r)]
  const requiredMonthlySIP =
    adjustedTarget / ((((1 + r) ** n - 1) / r) * (1 + r));

  const totalInvested = requiredMonthlySIP * n;
  const estimatedReturns = adjustedTarget - totalInvested;

  // Build yearly breakdown
  const yearlyBreakdown: YearlyData[] = [];
  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const fv =
      requiredMonthlySIP * (((1 + r) ** months - 1) / r) * (1 + r);
    const inv = requiredMonthlySIP * months;
    yearlyBreakdown.push({
      year: y,
      invested: inv,
      returns: fv - inv,
      total: fv,
    });
  }

  // Calculate milestones (when 25%, 50%, 75%, 100% of target is reached)
  const milestones: GoalMilestone[] = [];
  const milestonePcts = [25, 50, 75, 100];
  let nextMilestoneIdx = 0;

  for (let m = 1; m <= n && nextMilestoneIdx < milestonePcts.length; m++) {
    const fv =
      requiredMonthlySIP * (((1 + r) ** m - 1) / r) * (1 + r);
    const pct = (fv / adjustedTarget) * 100;
    while (
      nextMilestoneIdx < milestonePcts.length &&
      pct >= milestonePcts[nextMilestoneIdx]
    ) {
      milestones.push({
        percent: milestonePcts[nextMilestoneIdx],
        year: Math.ceil(m / 12),
        month: m,
      });
      nextMilestoneIdx++;
    }
  }

  return {
    requiredMonthlySIP,
    totalInvested,
    estimatedReturns,
    targetAmount,
    inflationAdjustedTarget: inflationRate !== null ? adjustedTarget : null,
    yearlyBreakdown,
    milestones,
  };
}

export function calculateSWP(
  corpus: number,
  monthlyWithdrawal: number,
  annualReturn: number,
  years: number,
): SWPResult {
  const r = annualReturn / 12 / 100;
  const totalMonths = years * 12;
  const breakdown: SWPMonthlyData[] = [];
  let balance = corpus;
  let corpusExhaustedMonth: number | null = null;
  let totalWithdrawn = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const opening = balance;
    const growth = opening * r;
    const withdrawal = Math.min(monthlyWithdrawal, opening + growth);
    const closing = opening + growth - withdrawal;

    totalWithdrawn += withdrawal;

    breakdown.push({
      month: m,
      year: Math.ceil(m / 12),
      openingBalance: opening,
      withdrawal,
      growth,
      closingBalance: closing,
    });

    balance = closing;

    if (closing <= 0 && corpusExhaustedMonth === null) {
      corpusExhaustedMonth = m;
      break;
    }
  }

  return {
    totalWithdrawn,
    remainingCorpus: Math.max(0, balance),
    corpusExhaustedMonth,
    monthlyBreakdown: breakdown,
  };
}
