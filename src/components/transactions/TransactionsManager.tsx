"use client";

import { useState } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/actions/transactions";
import { formatMoney } from "@/lib/format";
import { fieldClass, labelClass, cardClass } from "@/lib/ui";
import ConfirmSubmitForm from "@/components/ConfirmSubmitForm";
import CollapsibleForm from "@/components/CollapsibleForm";
import AnimatedList from "@/components/AnimatedList";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon } from "@/components/ui/icons";
import AccountFilter from "@/components/transactions/AccountFilter";

type Account = { id: string; name: string; currency: string };
type Transaction = {
  id: string;
  accountId: string;
  amountMinor: number;
  description: string | null;
  category: string | null;
  date: Date;
  account: Account;
};

function toDateInputValue(date: Date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function TransactionsManager({
  accounts,
  transactions,
  selectedAccountId,
}: {
  accounts: Account[];
  transactions: Transaction[];
  selectedAccountId?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const hasAccounts = accounts.length > 0;
  const notify = useToast();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every deposit and expense, in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AccountFilter accounts={accounts} selectedAccountId={selectedAccountId} />
          {hasAccounts && (
            <Button
              variant="primary"
              icon={showAddForm ? <XIcon size={14} /> : <PlusIcon size={14} />}
              onClick={() => setShowAddForm((v) => !v)}
            >
              {showAddForm ? "Close" : "Add transaction"}
            </Button>
          )}
        </div>
      </div>

      {!hasAccounts && (
        <p className="text-sm text-neutral-500">
          Add an account first before logging transactions.
        </p>
      )}

      <CollapsibleForm show={showAddForm}>
        <TransactionForm
          accounts={accounts}
          defaultAccountId={selectedAccountId}
          onSubmit={async (formData) => {
            try {
              await createTransaction(formData);
              notify("success", "Transaction added");
              setShowAddForm(false);
            } catch {
              notify("failed", "Couldn't add transaction");
            }
          }}
        />
      </CollapsibleForm>

      {transactions.length === 0 ? (
        <p className="text-sm text-neutral-500">No transactions yet.</p>
      ) : (
        <AnimatedList className="flex flex-col gap-2">
          {transactions.map((tx) =>
            editingId === tx.id ? (
              <div key={tx.id} className={`${cardClass} p-5`}>
                <TransactionForm
                  accounts={accounts}
                  transaction={tx}
                  onSubmit={async (formData) => {
                    try {
                      await updateTransaction(tx.id, formData);
                      notify("success", "Transaction updated");
                      setEditingId(null);
                    } catch {
                      notify("failed", "Couldn't update transaction");
                    }
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={tx.id}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 transition-colors hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-100">
                    {tx.description || tx.category || "Transaction"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {tx.account.name} · {new Date(tx.date).toLocaleDateString()}
                    {tx.category ? ` · ${tx.category}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      tx.amountMinor < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatMoney(tx.amountMinor, tx.account.currency)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PencilIcon size={13} />}
                    onClick={() => setEditingId(tx.id)}
                  >
                    Edit
                  </Button>
                  <ConfirmSubmitForm
                    action={async () => {
                      try {
                        await deleteTransaction(tx.id);
                        notify("success", "Transaction deleted");
                      } catch {
                        notify("failed", "Couldn't delete transaction");
                      }
                    }}
                    confirmMessage="Delete this transaction?"
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

function TransactionForm({
  accounts,
  transaction,
  defaultAccountId,
  onSubmit,
  onCancel,
}: {
  accounts: Account[];
  transaction?: Transaction;
  defaultAccountId?: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const defaultType = transaction
    ? transaction.amountMinor < 0
      ? "expense"
      : "income"
    : "expense";
  const defaultAmount = transaction
    ? (Math.abs(transaction.amountMinor) / 100).toFixed(2)
    : "";

  return (
    <form
      action={onSubmit}
      className={transaction ? "flex flex-col gap-3" : `flex flex-col gap-3 ${cardClass} p-5`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!transaction && (
          <div>
            <label className={labelClass}>Account</label>
            <select
              name="accountId"
              required
              defaultValue={defaultAccountId ?? accounts[0]?.id}
              className={fieldClass}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" defaultValue={defaultType} className={fieldClass}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultAmount}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={
              transaction ? toDateInputValue(transaction.date) : toDateInputValue(new Date())
            }
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            name="category"
            defaultValue={transaction?.category ?? ""}
            placeholder="e.g. Groceries"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input
            name="description"
            defaultValue={transaction?.description ?? ""}
            placeholder="Optional note"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" icon={<SaveIcon size={14} />}>
          Save
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
