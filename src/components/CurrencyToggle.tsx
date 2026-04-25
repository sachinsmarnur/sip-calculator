"use client";

import { CurrencyCode, useCurrency } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
];

export function CurrencyToggle() {
  const { currencyCode, setCurrencyCode } = useCurrency();

  const currentCurrency = currencies.find((c) => c.code === currencyCode) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-9 px-3 flex items-center gap-1.5 rounded-xl bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring border border-sidebar-border"
          data-ocid="currency.toggle"
        >
          <span className="font-medium text-sm">{currentCurrency.symbol}</span>
          <span className="text-xs font-semibold">{currentCurrency.code}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setCurrencyCode(currency.code)}
            className="flex items-center justify-between min-w-[140px]"
            data-ocid={`currency.select_${currency.code}`}
          >
            <span>{currency.label}</span>
            <span className="font-semibold text-muted-foreground">
              {currency.symbol}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
