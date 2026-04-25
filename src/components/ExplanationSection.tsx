"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ExplanationSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ExplanationSection({
  title,
  children,
}: ExplanationSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <span className="font-display font-semibold text-base text-foreground">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-card border-t border-border/40 prose prose-sm dark:prose-invert max-w-none text-foreground/80">
          {children}
        </div>
      )}
    </div>
  );
}
