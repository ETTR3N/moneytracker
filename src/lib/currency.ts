import "server-only";
import { prisma } from "@/lib/prisma";
export { formatMoney } from "@/lib/format";

// Reference currency all cached rates are stored against.
const ANCHOR = "USD";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "RON", name: "Romanian Leu" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "ILS", name: "Israeli Shekel" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "KRW", name: "South Korean Won" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ZAR", name: "South African Rand" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "THB", name: "Thai Baht" },
  { code: "ISK", name: "Icelandic Krona" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

/**
 * Rates are always stored relative to ANCHOR (USD) so a single cached row
 * lets us convert between any two supported currencies.
 */
export async function getRates(): Promise<Record<string, number>> {
  const cached = await prisma.exchangeRate.findUnique({
    where: { base: ANCHOR },
  });
  const isFresh =
    cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;

  if (cached && isFresh) {
    return JSON.parse(cached.rates);
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${ANCHOR}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`rate fetch failed: ${res.status}`);
    const data = (await res.json()) as { rates: Record<string, number> };
    const rates: Record<string, number> = { ...data.rates, [ANCHOR]: 1 };

    await prisma.exchangeRate.upsert({
      where: { base: ANCHOR },
      update: { rates: JSON.stringify(rates), fetchedAt: new Date() },
      create: { base: ANCHOR, rates: JSON.stringify(rates) },
    });

    return rates;
  } catch {
    if (cached) return JSON.parse(cached.rates);
    return { [ANCHOR]: 1 };
  }
}

export function convertMinor(
  amountMinor: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amountMinor;
  const rateFrom = rates[from];
  const rateTo = rates[to];
  if (!rateFrom || !rateTo) return amountMinor;
  const amountInAnchor = amountMinor / rateFrom;
  return Math.round(amountInAnchor * rateTo);
}

