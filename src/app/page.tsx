import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { formatMoney, CURRENCIES } from "@/lib/currency";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import CurrencySwitcher from "@/components/dashboard/CurrencySwitcher";
import AnimatedList from "@/components/AnimatedList";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const currency = data.displayCurrency;

  const totalSpendingThisMonth =
    data.spendingByMonth[data.spendingByMonth.length - 1]?.amountMinor ?? 0;

  const netWorthSpark = data.netWorthByMonth.slice(-6).map((m) => m.amountMinor);
  const spendingSpark = data.spendingByMonth.slice(-6).map((m) => m.amountMinor);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl light:text-neutral-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Everything converted to {currency}.
          </p>
        </div>
        <CurrencySwitcher currencies={CURRENCIES} current={currency} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total net worth"
          value={data.totalNetWorth}
          currency={currency}
          color="#34d399"
          sparkline={netWorthSpark}
          index={0}
        />
        <StatCard
          label="Spending this month"
          value={totalSpendingThisMonth}
          currency={currency}
          color="#fb7185"
          sparkline={spendingSpark}
          index={1}
        />
        <StatCard
          label="Monthly subscriptions"
          value={data.monthlySubscriptionTotal}
          currency={currency}
          color="#38bdf8"
          index={2}
        />
      </div>

      <ChartCard
        currency={currency}
        netWorthByMonth={data.netWorthByMonth}
        spendingByMonth={data.spendingByMonth}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 light:border-neutral-200 light:bg-white">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200 light:text-neutral-800">Accounts</h2>
            <Link href="/accounts" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 light:text-emerald-600 light:hover:text-emerald-700">
              Manage →
            </Link>
          </div>
          {data.accountBalances.length === 0 ? (
            <p className="text-sm text-neutral-500">No accounts yet.</p>
          ) : (
            <AnimatedList>
              {data.accountBalances.map((account) => (
                <div key={account.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-neutral-200 light:text-neutral-700">{account.name}</span>
                  <span className="shrink-0 font-medium tabular-nums text-neutral-400 light:text-neutral-500">
                    {formatMoney(account.balanceMinor, account.currency)}
                  </span>
                </div>
              ))}
            </AnimatedList>
          )}
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 light:border-neutral-200 light:bg-white">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200 light:text-neutral-800">
              Upcoming subscriptions
            </h2>
            <Link href="/subscriptions" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 light:text-emerald-600 light:hover:text-emerald-700">
              Manage →
            </Link>
          </div>
          {data.upcomingSubscriptions.length === 0 ? (
            <p className="text-sm text-neutral-500">No active subscriptions.</p>
          ) : (
            <AnimatedList>
              {data.upcomingSubscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-neutral-200 light:text-neutral-700">{sub.name}</span>
                  <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-neutral-400 light:text-neutral-500">
                    {formatMoney(sub.amountMinor, sub.currency)} ·{" "}
                    {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </AnimatedList>
          )}
        </section>
      </div>
    </div>
  );
}
