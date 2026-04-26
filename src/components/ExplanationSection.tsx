import { cn } from "@/lib/utils";

interface ExplanationSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ExplanationSection({
  title,
  children,
}: ExplanationSectionProps) {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div className="w-full px-5 py-4 bg-muted/30 border-b border-border/40">
        <h2 className="font-display font-semibold text-lg text-foreground m-0">
          {title}
        </h2>
      </div>
      <div className="px-5 py-5 bg-card prose prose-sm dark:prose-invert max-w-none text-foreground/80">
        {children}
      </div>
    </div>
  );
}
