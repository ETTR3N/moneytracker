import "server-only";
import { getDashboardData, getSubscriptionsList, getTransactionsList } from "@/lib/data";
import { formatMoney } from "@/lib/format";

const RECENT_TRANSACTIONS_COUNT = 20;
const SPENDING_MONTHS_SHOWN = 6;

export async function buildFinancialContext(): Promise<string> {
  const [dashboard, subscriptions, transactions] = await Promise.all([
    getDashboardData(),
    getSubscriptionsList(),
    getTransactionsList(),
  ]);

  const currency = dashboard.displayCurrency;
  const lines: string[] = [];

  lines.push(`Today's date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Display currency: ${currency}`);
  lines.push("");

  lines.push("ACCOUNTS:");
  if (dashboard.accountBalances.length === 0) {
    lines.push("(no accounts yet)");
  } else {
    for (const a of dashboard.accountBalances) {
      lines.push(
        `- ${a.name}: ${formatMoney(a.balanceMinor, a.currency)} (≈ ${formatMoney(a.convertedMinor, currency)})`
      );
    }
  }
  lines.push(`Total net worth (in ${currency}): ${formatMoney(dashboard.totalNetWorth, currency)}`);
  lines.push("");

  lines.push(`MONTHLY SPENDING (last ${SPENDING_MONTHS_SHOWN} months, in ${currency}):`);
  for (const m of dashboard.spendingByMonth.slice(-SPENDING_MONTHS_SHOWN)) {
    lines.push(`- ${m.label}: ${formatMoney(m.amountMinor, currency)}`);
  }
  lines.push("");

  const activeSubs = subscriptions.filter((s) => s.active);
  lines.push("ACTIVE SUBSCRIPTIONS:");
  if (activeSubs.length === 0) {
    lines.push("(none)");
  } else {
    for (const s of activeSubs) {
      lines.push(
        `- ${s.name}: ${formatMoney(s.amountMinor, s.currency)} / ${s.billingCycle.toLowerCase()}, next billing ${new Date(s.nextBillingDate).toISOString().slice(0, 10)}${s.account ? ` (paid from ${s.account.name})` : ""}`
      );
    }
  }
  lines.push(
    `Total recurring cost (in ${currency}, normalized to monthly): ${formatMoney(dashboard.monthlySubscriptionTotal, currency)}`
  );
  const pausedSubs = subscriptions.filter((s) => !s.active);
  if (pausedSubs.length > 0) {
    lines.push(`Paused subscriptions: ${pausedSubs.map((s) => s.name).join(", ")}`);
  }
  lines.push("");

  lines.push(`RECENT TRANSACTIONS (most recent ${RECENT_TRANSACTIONS_COUNT}):`);
  if (transactions.length === 0) {
    lines.push("(none)");
  } else {
    for (const t of transactions.slice(0, RECENT_TRANSACTIONS_COUNT)) {
      const date = new Date(t.date).toISOString().slice(0, 10);
      const label = t.description || t.category || "Transaction";
      lines.push(
        `- ${date}: ${formatMoney(t.amountMinor, t.account.currency)} — ${label}${t.category ? ` [${t.category}]` : ""} (${t.account.name})`
      );
    }
  }

  return lines.join("\n");
}

export const ASSISTANT_SYSTEM_PROMPT = `You are a helpful, concise personal finance assistant built into the user's own money-tracking app. You have access to their real, current financial data below — accounts, balances, spending history, subscriptions, and recent transactions. Use it to give specific, personalized answers rather than generic advice.

Guidelines:
- Reference actual numbers, account names, and subscriptions from the data when relevant.
- Be direct and practical. Point out things like unusually high spending categories, subscriptions that might be worth cancelling, or opportunities to save.
- Do not invent data that isn't provided.
- Keep responses focused and readable — use short paragraphs or bullet points rather than long essays.
- You are not a licensed financial advisor; for major decisions (investing, taxes, debt), give balanced, sensible guidance but note the user should consult a professional for anything high-stakes.`;
