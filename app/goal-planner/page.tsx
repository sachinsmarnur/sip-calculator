import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { GoalPlannerCalculator } from "@/components/GoalPlannerCalculator";

export const metadata: Metadata = {
  title: "Reverse Goal SIP Planner - Calculate Monthly Investment Needed",
  description:
    "Plan your financial goals with our Reverse Goal SIP Planner with inflation. Calculate exactly how much you need to invest monthly to reach your target retirement or purchase goal.",
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/goal-planner",
  },
  openGraph: {
    title: "Reverse Goal SIP Planner - Calculate Monthly Investment Needed | InvestCalc",
    description:
      "Plan your financial goals with our Reverse Goal SIP Planner with inflation. Calculate exactly how much you need to invest monthly to reach your target retirement or purchase goal.",
    url: "https://sipinvestment-calculator.vercel.app/goal-planner",
  },
};

export default function GoalPlannerPage() {
  return (
    <CalculatorLayout>
      <GoalPlannerCalculator />
    </CalculatorLayout>
  );
}
