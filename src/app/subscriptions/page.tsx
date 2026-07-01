import { getSubscriptionsList, getAccountsWithBalances } from "@/lib/data";
import { CURRENCIES } from "@/lib/currency";
import SubscriptionsManager from "@/components/subscriptions/SubscriptionsManager";

export default async function SubscriptionsPage() {
  const [subscriptions, accounts] = await Promise.all([
    getSubscriptionsList(),
    getAccountsWithBalances(),
  ]);

  return (
    <SubscriptionsManager
      subscriptions={subscriptions}
      accounts={accounts}
      currencies={CURRENCIES}
    />
  );
}
