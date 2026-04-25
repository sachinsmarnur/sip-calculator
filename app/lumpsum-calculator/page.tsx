import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { LumpSumCalculator } from "@/components/LumpSumCalculator";

export const metadata: Metadata = {
  title: "Lump Sum Investment Calculator with Inflation & Growth",
  description:
    "Estimate the future value of your one-time investments with our Lump Sum calculator with inflation. Understand compounding growth for your fixed deposits and mutual funds.",
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/lumpsum-calculator",
  },
  openGraph: {
    title: "Lump Sum Investment Calculator with Inflation & Growth | InvestCalc",
    description:
      "Estimate the future value of your one-time investments with our Lump Sum calculator with inflation. Understand compounding growth for your fixed deposits and mutual funds.",
    url: "https://sipinvestment-calculator.vercel.app/lumpsum-calculator",
  },
};

export default function LumpSumPage() {
  return (
    <CalculatorLayout>
      <LumpSumCalculator />
    </CalculatorLayout>
  );
}
