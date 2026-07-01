import { getAccountsWithBalances, getTransactionsList } from "@/lib/data";
import TransactionsManager from "@/components/transactions/TransactionsManager";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;
  const [accounts, transactions] = await Promise.all([
    getAccountsWithBalances(),
    getTransactionsList(accountId),
  ]);

  return (
    <TransactionsManager
      accounts={accounts}
      transactions={transactions}
      selectedAccountId={accountId}
    />
  );
}
