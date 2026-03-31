import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { CalculatorLayout } from "./components/CalculatorLayout";
import { GoalPlannerCalculator } from "./components/GoalPlannerCalculator";
import { LumpSumCalculator } from "./components/LumpSumCalculator";
import { SIPCalculator } from "./components/SIPCalculator";
import { StepUpCalculator } from "./components/StepUpCalculator";
import { SWPCalculator } from "./components/SWPCalculator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CalculatorLayout />}>
          <Route path="/" element={<Navigate to="/sip-calculator" replace />} />
          <Route path="/sip-calculator" element={<SIPCalculator />} />
          <Route path="/step-up-calculator" element={<StepUpCalculator />} />
          <Route path="/lumpsum-calculator" element={<LumpSumCalculator />} />
          <Route path="/goal-planner" element={<GoalPlannerCalculator />} />
          <Route path="/swp-calculator" element={<SWPCalculator />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/sip-calculator" replace />} />
        </Route>
      </Routes>

      {/* Toaster for export notifications */}
      <Toaster richColors position="bottom-right" />
    </BrowserRouter>
  );
}
