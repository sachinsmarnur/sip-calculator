export interface SIPResult {
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
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

export function calculateSIP(
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
): SIPResult {
  const r = annualReturn / 12 / 100;
  const n = years * 12;
  const maturityValue = monthlyInvestment * (((1 + r) ** n - 1) / r) * (1 + r);
  const totalInvested = monthlyInvestment * n;
  const estimatedReturns = maturityValue - totalInvested;

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

  return { totalInvested, estimatedReturns, maturityValue, yearlyBreakdown };
}

export function calculateLumpSum(
  principal: number,
  annualReturn: number,
  years: number,
): LumpSumResult {
  const maturityValue = principal * (1 + annualReturn / 100) ** years;
  const estimatedReturns = maturityValue - principal;

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

  return { principal, estimatedReturns, maturityValue, yearlyGrowth };
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
