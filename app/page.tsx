import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { SIPCalculator } from "@/components/SIPCalculator";

export const metadata: Metadata = {
  title: "SIP Calculator with Inflation Adjustment & Multi-Currency",
  description:
    "Calculate real returns with our advanced SIP calculator with inflation adjustment. Plan your monthly systematic investment plan with multi-currency support and growth charts.",
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/",
  },
  openGraph: {
    title: "SIP Calculator with Inflation Adjustment & Multi-Currency | InvestCalc",
    description:
      "Calculate real returns with our advanced SIP calculator with inflation adjustment. Plan your monthly systematic investment plan with multi-currency support and growth charts.",
    url: "https://sipinvestment-calculator.vercel.app/",
  },
};

export default function SIPPage() {
  return (
    <CalculatorLayout>
      <SIPCalculator />
    </CalculatorLayout>
  );
}
