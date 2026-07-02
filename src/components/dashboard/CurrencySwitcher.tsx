"use client";

import { useRef } from "react";
import { updateDisplayCurrency } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/ToastProvider";

type Currency = { code: string; name: string };

export default function CurrencySwitcher({
  currencies,
  current,
}: {
  currencies: readonly Currency[];
  current: string;
}) {
  const notify = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const next = String(formData.get("displayCurrency"));
        try {
          await updateDisplayCurrency(formData);
          notify("success", `Now viewing net worth in ${next}`);
        } catch {
          notify("failed", "Couldn't switch currency");
        }
      }}
    >
      <label className="sr-only" htmlFor="dashboard-currency">
        Display currency
      </label>
      <select
        key={current}
        id="dashboard-currency"
        name="displayCurrency"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3.5 py-1.5 text-sm font-medium text-neutral-200 outline-none transition-colors hover:border-neutral-600 focus:border-emerald-500 light:border-neutral-300 light:bg-white light:text-neutral-700 light:hover:border-neutral-400"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            View in {c.code}
          </option>
        ))}
      </select>
    </form>
  );
}
