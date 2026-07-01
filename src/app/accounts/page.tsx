import { getAccountsWithBalances } from "@/lib/data";
import { CURRENCIES } from "@/lib/currency";
import AccountsManager from "@/components/accounts/AccountsManager";

export default async function AccountsPage() {
  const accounts = await getAccountsWithBalances();

  return <AccountsManager accounts={accounts} currencies={CURRENCIES} />;
}
