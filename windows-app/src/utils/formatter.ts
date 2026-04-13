/** Format time until a reset date as a human-readable string */
export function timeUntilReset(resetDateISO: string): string {
  const reset = new Date(resetDateISO);
  const now = new Date();
  const diffMs = reset.getTime() - now.getTime();

  if (diffMs <= 0) return "now";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  return `in ${minutes}m`;
}

/** Format a reset time for display (e.g., "3:45 PM" or "15:45") */
export function formatResetTime(resetDateISO: string, use24h = false): string {
  const date = new Date(resetDateISO);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !use24h,
  });
}

/** Format percentage with appropriate precision */
export function formatPercentage(value: number): string {
  if (value === 0) return "0%";
  if (value >= 100) return "100%";
  if (value < 1) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

/** Format currency amount */
export function formatCurrency(amount: number, currencyCode = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
