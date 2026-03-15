export function formatINR(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_00_00_000) {
      return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
    }
    if (value >= 1_00_000) {
      return `₹${(value / 1_00_000).toFixed(2)} L`;
    }
    if (value >= 1_000) {
      return `₹${(value / 1_000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0)
    return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}
