import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { StepUpCalculator } from "@/components/StepUpCalculator";

export const metadata: Metadata = {
  title: "Step-Up SIP Calculator for Wealth Growth & Compounding",
  description:
    "Maximize your future corpus with our Step-Up SIP calculator. See how a small annual increase in your monthly SIP can significantly boost your long-term wealth compounding.",
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/step-up-calculator",
  },
  openGraph: {
    title: "Step-Up SIP Calculator for Wealth Growth & Compounding | InvestCalc",
    description:
      "Maximize your future corpus with our Step-Up SIP calculator. See how a small annual increase in your monthly SIP can significantly boost your long-term wealth compounding.",
    url: "https://sipinvestment-calculator.vercel.app/step-up-calculator",
  },
};

export default function StepUpPage() {
  return (
    <CalculatorLayout>
      <StepUpCalculator />
    </CalculatorLayout>
  );
}
