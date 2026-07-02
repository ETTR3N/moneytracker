"use client";

import { useState } from "react";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounts";
import { formatMoney } from "@/lib/format";
import { fieldClass, labelClass, cardClass } from "@/lib/ui";
import CurrencySelect from "@/components/CurrencySelect";
import ConfirmSubmitForm from "@/components/ConfirmSubmitForm";
import CollapsibleForm from "@/components/CollapsibleForm";
import AnimatedList from "@/components/AnimatedList";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon } from "@/components/ui/icons";

type Currency = { code: string; name: string };
type Account = {
  id: string;
  name: string;
  currency: string;
  startingBalance: number;
  balanceMinor: number;
};

export default function AccountsManager({
  accounts,
  currencies,
}: {
  accounts: Account[];
  currencies: readonly Currency[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(accounts.length === 0);
  const notify = useToast();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50 light:text-neutral-900">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every place your money lives, in whatever currency it&apos;s in.
          </p>
        </div>
        <Button
          variant="primary"
          icon={showAddForm ? <XIcon size={14} /> : <PlusIcon size={14} />}
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? "Close" : "Add account"}
        </Button>
      </div>

      <CollapsibleForm show={showAddForm}>
        <form
          action={async (formData) => {
            try {
              await createAccount(formData);
              notify("success", "Account added");
              setShowAddForm(false);
            } catch {
              notify("failed", "Couldn't add account");
            }
          }}
          className={`flex flex-col gap-3 ${cardClass} p-5 sm:flex-row sm:items-end`}
        >
          <div className="flex-1">
            <label className={labelClass}>Name</label>
            <input name="name" required placeholder="e.g. Checking account" className={fieldClass} />
          </div>
          <div className="sm:w-56">
            <label className={labelClass}>Currency</label>
            <CurrencySelect currencies={currencies} name="currency" />
          </div>
          <div className="sm:w-40">
            <label className={labelClass}>Starting balance</label>
            <input name="startingBalance" type="number" step="0.01" defaultValue="0" className={fieldClass} />
          </div>
          <Button type="submit" variant="primary" icon={<SaveIcon size={14} />}>
            Save
          </Button>
        </form>
      </CollapsibleForm>

      {accounts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No accounts yet. Add one to start tracking balances.
        </p>
      ) : (
        <AnimatedList className="flex flex-col gap-3">
          {accounts.map((account) =>
            editingId === account.id ? (
              <div key={account.id} className={`${cardClass} p-5`}>
                <form
                  action={async (formData) => {
                    try {
                      await updateAccount(account.id, formData);
                      notify("success", "Account updated");
                      setEditingId(null);
                    } catch {
                      notify("failed", "Couldn't update account");
                    }
                  }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1">
                    <label className={labelClass}>Name</label>
                    <input name="name" defaultValue={account.name} required className={fieldClass} />
                  </div>
                  <div className="sm:w-56">
                    <label className={labelClass}>Currency</label>
                    <CurrencySelect currencies={currencies} name="currency" defaultValue={account.currency} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="primary" icon={<SaveIcon size={14} />}>
                      Save
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div
                key={account.id}
                className={`flex flex-col gap-3 ${cardClass} p-5 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div>
                  <p className="font-medium text-neutral-100 light:text-neutral-900">{account.name}</p>
                  <p className="text-sm text-neutral-500">{account.currency}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold tabular-nums text-neutral-50 light:text-neutral-900">
                    {formatMoney(account.balanceMinor, account.currency)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PencilIcon size={13} />}
                    onClick={() => setEditingId(account.id)}
                  >
                    Edit
                  </Button>
                  <ConfirmSubmitForm
                    action={async () => {
                      try {
                        await deleteAccount(account.id);
                        notify("success", "Account deleted");
                      } catch {
                        notify("failed", "Couldn't delete account");
                      }
                    }}
                    confirmMessage={`Delete "${account.name}"? This also deletes its transactions.`}
                  >
                    <Button type="submit" variant="danger" size="sm" icon={<TrashIcon size={13} />}>
                      Delete
                    </Button>
                  </ConfirmSubmitForm>
                </div>
              </div>
            )
          )}
        </AnimatedList>
      )}
    </div>
  );
}
