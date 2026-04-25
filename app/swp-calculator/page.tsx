import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { SWPCalculator } from "@/components/SWPCalculator";

export const metadata: Metadata = {
  title: "SWP Calculator with Inflation - Retirement Withdrawal Planner",
  description:
    "Estimate your regular monthly income with our SWP calculator with inflation adjustment. Plan your systematic withdrawals and manage your post-retirement balance.",
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/swp-calculator",
  },
  openGraph: {
    title: "SWP Calculator with Inflation - Retirement Withdrawal Planner | InvestCalc",
    description:
      "Estimate your regular monthly income with our SWP calculator with inflation adjustment. Plan your systematic withdrawals and manage your post-retirement balance.",
    url: "https://sipinvestment-calculator.vercel.app/swp-calculator",
  },
};

export default function SWPPage() {
  return (
    <CalculatorLayout>
      <SWPCalculator />
    </CalculatorLayout>
  );
}
