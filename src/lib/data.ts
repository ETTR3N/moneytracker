import "server-only";
import { prisma } from "@/lib/prisma";
import { getRates, convertMinor } from "@/lib/currency";
import { monthlyEquivalentMinor } from "@/lib/money";

export async function getSettingsRecord() {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
  });
  return settings ?? { id: "singleton", displayCurrency: "USD" };
}

export async function getAccountsWithBalances() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "asc" },
    include: { transactions: { select: { amountMinor: true } } },
  });

  return accounts.map((account) => {
    const txTotal = account.transactions.reduce(
      (sum, t) => sum + t.amountMinor,
      0
    );
    return {
      id: account.id,
      name: account.name,
      currency: account.currency,
      startingBalance: account.startingBalance,
      balanceMinor: account.startingBalance + txTotal,
      createdAt: account.createdAt,
    };
  });
}

export async function getTransactionsList(accountId?: string) {
  return prisma.transaction.findMany({
    where: accountId ? { accountId } : undefined,
    orderBy: { date: "desc" },
    include: { account: { select: { id: true, name: true, currency: true } } },
  });
}

export async function getSubscriptionsList() {
  return prisma.subscription.findMany({
    orderBy: { nextBillingDate: "asc" },
    include: { account: { select: { id: true, name: true, currency: true } } },
  });
}

const MONTHS_OF_HISTORY = 12;

function buildMonthBuckets() {
  const now = new Date();
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = MONTHS_OF_HISTORY - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      label: start.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      }),
      start,
      end,
    });
  }
  return months;
}

export async function getDashboardData() {
  const settings = await getSettingsRecord();
  const displayCurrency = settings.displayCurrency;
  const rates = await getRates();

  const accounts = await prisma.account.findMany({
    include: {
      transactions: { select: { amountMinor: true, date: true } },
    },
  });

  const accountBalances = accounts.map((account) => {
    const txTotal = account.transactions.reduce(
      (sum, t) => sum + t.amountMinor,
      0
    );
    const balanceMinor = account.startingBalance + txTotal;
    return {
      id: account.id,
      name: account.name,
      currency: account.currency,
      balanceMinor,
      convertedMinor: convertMinor(
        balanceMinor,
        account.currency,
        displayCurrency,
        rates
      ),
    };
  });

  const totalNetWorth = accountBalances.reduce(
    (sum, a) => sum + a.convertedMinor,
    0
  );

  const months = buildMonthBuckets();
  const spendingByMonth = months.map((m) => ({
    key: m.key,
    label: m.label,
    amountMinor: 0,
  }));

  const startingTotal = accounts.reduce(
    (sum, account) =>
      sum +
      convertMinor(
        account.startingBalance,
        account.currency,
        displayCurrency,
        rates
      ),
    0
  );

  const netWorthByMonth = months.map((m) => {
    let cumulative = startingTotal;
    for (const account of accounts) {
      for (const tx of account.transactions) {
        if (tx.date < m.end) {
          cumulative += convertMinor(
            tx.amountMinor,
            account.currency,
            displayCurrency,
            rates
          );
        }
        if (tx.date >= m.start && tx.date < m.end && tx.amountMinor < 0) {
          const bucket = spendingByMonth.find((s) => s.key === m.key);
          if (bucket) {
            bucket.amountMinor += convertMinor(
              -tx.amountMinor,
              account.currency,
              displayCurrency,
              rates
            );
          }
        }
      }
    }
    return { key: m.key, label: m.label, amountMinor: cumulative };
  });

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { active: true },
  });

  const monthlySubscriptionTotal = activeSubscriptions.reduce((sum, sub) => {
    const monthlyMinor = monthlyEquivalentMinor(
      sub.amountMinor,
      sub.billingCycle
    );
    return (
      sum + convertMinor(monthlyMinor, sub.currency, displayCurrency, rates)
    );
  }, 0);

  const upcomingSubscriptions = await prisma.subscription.findMany({
    where: { active: true },
    orderBy: { nextBillingDate: "asc" },
    take: 5,
  });

  return {
    displayCurrency,
    totalNetWorth,
    accountBalances,
    spendingByMonth,
    netWorthByMonth,
    monthlySubscriptionTotal,
    upcomingSubscriptions,
  };
}
