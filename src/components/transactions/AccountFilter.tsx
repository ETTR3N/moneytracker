"use client";

import { useRouter } from "next/navigation";

export default function AccountFilter({
  accounts,
  selectedAccountId,
}: {
  accounts: { id: string; name: string }[];
  selectedAccountId?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedAccountId ?? "all"}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value === "all" ? "/transactions" : `/transactions?accountId=${value}`);
      }}
      className="rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-emerald-500 light:border-neutral-300 light:bg-white light:text-neutral-900"
    >
      <option value="all">All accounts</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
