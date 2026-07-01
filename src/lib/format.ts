export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amountMinor / 100);
}
