"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  formatDisplay?: (v: number) => string;
  inputId?: string;
  ocidInput?: string;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  inputId,
  ocidInput,
}: SliderInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!Number.isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={inputId}
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </Label>
        <div className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
          {prefix && (
            <span className="text-xs font-medium text-muted-foreground">
              {prefix}
            </span>
          )}
          <Input
            id={inputId}
            data-ocid={ocidInput}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="h-7 w-24 border-0 bg-transparent p-0 text-right text-sm font-bold text-foreground focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="text-xs font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {prefix}
          {min.toLocaleString("en-IN")}
          {suffix}
        </span>
        <span>
          {prefix}
          {max.toLocaleString("en-IN")}
          {suffix}
        </span>
      </div>
    </div>
  );
}
