export function toMinorUnits(input: string): number {
  const n = parseFloat(input);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromMinorUnits(minor: number): string {
  return (minor / 100).toFixed(2);
}

export function monthlyEquivalentMinor(
  amountMinor: number,
  billingCycle: string
): number {
  switch (billingCycle) {
    case "WEEKLY":
      return Math.round((amountMinor * 52) / 12);
    case "YEARLY":
      return Math.round(amountMinor / 12);
    default:
      return amountMinor;
  }
}

export function advanceBillingDate(date: Date, billingCycle: string): Date {
  const d = new Date(date);
  switch (billingCycle) {
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export const BILLING_CYCLES = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];
