import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  highlight?: boolean;
  color?: "green" | "amber" | "default";
}

export function ResultStat({
  label,
  value,
  highlight,
  color = "default",
}: StatProps) {
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
      <p
        className={cn(
          "text-xl font-bold font-display",
          color === "green" && "text-chart-1",
          color === "amber" && "text-chart-2",
          color === "default" && highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
