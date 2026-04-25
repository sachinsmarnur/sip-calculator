"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  setCurrencyCode: (code: CurrencyCode) => void;
  currencySymbol: string;
  formatCurrency: (value: number, compact?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const currencySymbols: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useLocalStorage<CurrencyCode>("app-currency", "INR");

  const currencySymbol = currencySymbols[currencyCode] || "₹";

  const formatCurrency = (value: number, compact = false): string => {
    if (compact) {
      if (currencyCode === "INR") {
        if (value >= 1_00_00_000) return `${currencySymbol}${(value / 1_00_00_000).toFixed(2)} Cr`;
        if (value >= 1_00_000) return `${currencySymbol}${(value / 1_00_000).toFixed(2)} L`;
      } else {
        if (value >= 1_000_000) return `${currencySymbol}${(value / 1_000_000).toFixed(2)}M`;
      }
      if (value >= 1_000) return `${currencySymbol}${(value / 1_000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode, currencySymbol, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
