"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoIcon } from "lucide-react";

export interface TaxToggleProps {
  applyTax: boolean;
  onApplyTaxChange: (checked: boolean) => void;
  fundType: "equity" | "debt";
  onFundTypeChange: (value: "equity" | "debt") => void;
  taxSlab: number;
  onTaxSlabChange: (value: number) => void;
  years: number;
}

export function TaxToggle({
  applyTax,
  onApplyTaxChange,
  fundType,
  onFundTypeChange,
  taxSlab,
  onTaxSlabChange,
  years,
}: TaxToggleProps) {
  const isLTCG = years >= 1; // Equity holding period >= 1 year is LTCG

  return (
    <div className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label
            htmlFor="tax-toggle"
            className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-2"
          >
            Apply Capital Gains Tax
            {applyTax && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 flex items-center bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50">
                FY25 Rules
              </Badge>
            )}
          </Label>
        </div>
        <Switch
          id="tax-toggle"
          checked={applyTax}
          onCheckedChange={onApplyTaxChange}
        />
      </div>

      {applyTax && (
        <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50 animate-fade-in slide-in-from-top-2">
          {/* Fund Type Segmented Control */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fund Type</Label>
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => onFundTypeChange("equity")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                  fundType === "equity"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Equity
              </button>
              <button
                type="button"
                onClick={() => onFundTypeChange("debt")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                  fundType === "debt"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Debt
              </button>
            </div>
          </div>

          {/* Details & Slab Selection */}
          {fundType === "equity" ? (
             <div className="flex items-center justify-between bg-background p-3 rounded-lg border border-border/50">
               <div className="space-y-1">
                 <p className="text-sm font-medium">Holding Period: {years} {years === 1 ? 'Year' : 'Years'}</p>
                 <p className="text-xs text-muted-foreground">
                   {isLTCG 
                     ? "LTCG @ 12.5% (₹1.25L exemption)" 
                     : "STCG @ 20% flat"}
                 </p>
               </div>
               <Badge className={isLTCG ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50" : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"} variant="secondary">
                 {isLTCG ? "LTCG" : "STCG"}
               </Badge>
             </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Income Tax Slab</Label>
              <Select value={taxSlab.toString()} onValueChange={(v) => onTaxSlabChange(Number(v))}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select Tax Slab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5% Bracket</SelectItem>
                  <SelectItem value="10">10% Bracket</SelectItem>
                  <SelectItem value="20">20% Bracket</SelectItem>
                  <SelectItem value="30">30% Bracket</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                 Debt funds are taxed at your applicable slab rate.
               </p>
            </div>
          )}

          <div className="flex gap-2 items-start text-xs text-muted-foreground bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-100/50 dark:border-blue-900/50">
            <InfoIcon className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
            <p>Based on Indian tax law post Budget 2024. Surcharge and cess are not included for simplicity.</p>
          </div>
        </div>
      )}
    </div>
  );
}
