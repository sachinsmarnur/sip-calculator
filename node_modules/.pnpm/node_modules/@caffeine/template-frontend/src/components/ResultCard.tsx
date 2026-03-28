import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatProps {
  label: string;
  value: string;
  numericValue?: number;
  highlight?: boolean;
  color?: "green" | "amber" | "default";
}

export function ResultStat({
  label,
  value,
  numericValue,
  highlight,
  color = "default",
}: StatProps) {
  const textColorClass = cn(
    "text-xl font-bold font-display",
    color === "green" && "text-chart-1",
    color === "amber" && "text-chart-2",
    color === "default" && highlight ? "text-primary" : "",
    color === "default" && !highlight && "text-foreground",
  );

  return (
    <div
      className={cn(
        "rounded-xl p-4 transition-all",
        highlight
          ? "bg-primary/10 border border-primary/20"
          : "bg-muted/60 border border-border/50",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      {numericValue !== undefined ? (
        <AnimatedNumber
          value={numericValue}
          compact
          className={textColorClass}
        />
      ) : (
        <p className={textColorClass}>{value}</p>
      )}
    </div>
  );
}
