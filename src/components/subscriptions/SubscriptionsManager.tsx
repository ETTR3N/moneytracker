"use client";

import { useState } from "react";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscriptionActive,
  markSubscriptionPaid,
} from "@/lib/actions/subscriptions";
import { formatMoney } from "@/lib/format";
import { fieldClass, labelClass, cardClass } from "@/lib/ui";
import CurrencySelect from "@/components/CurrencySelect";
import ConfirmSubmitForm from "@/components/ConfirmSubmitForm";
import CollapsibleForm from "@/components/CollapsibleForm";
import AnimatedList from "@/components/AnimatedList";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SaveIcon,
  XIcon,
  CheckIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/ui/icons";

type Currency = { code: string; name: string };
type Account = { id: string; name: string; currency: string };
type Subscription = {
  id: string;
  name: string;
  amountMinor: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: Date;
  active: boolean;
  accountId: string | null;
  account: Account | null;
};

function toDateInputValue(date: Date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function SubscriptionsManager({
  subscriptions,
  accounts,
  currencies,
}: {
  subscriptions: Subscription[];
  accounts: Account[];
  currencies: readonly Currency[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(subscriptions.length === 0);
  const notify = useToast();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Recurring costs, tracked so nothing renews as a surprise.
          </p>
        </div>
        <Button
          variant="primary"
          icon={showAddForm ? <XIcon size={14} /> : <PlusIcon size={14} />}
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? "Close" : "Add subscription"}
        </Button>
      </div>

      <CollapsibleForm show={showAddForm}>
        <SubscriptionForm
          accounts={accounts}
          currencies={currencies}
          onSubmit={async (formData) => {
            try {
              await createSubscription(formData);
              notify("success", "Subscription added");
              setShowAddForm(false);
            } catch {
              notify("failed", "Couldn't add subscription");
            }
          }}
        />
      </CollapsibleForm>

      {subscriptions.length === 0 ? (
        <p className="text-sm text-neutral-500">No subscriptions yet.</p>
      ) : (
        <AnimatedList className="flex flex-col gap-3">
          {subscriptions.map((sub) =>
            editingId === sub.id ? (
              <div key={sub.id} className={`${cardClass} p-5`}>
                <SubscriptionForm
                  accounts={accounts}
                  currencies={currencies}
                  subscription={sub}
                  onSubmit={async (formData) => {
                    try {
                      await updateSubscription(sub.id, formData);
                      notify("success", "Subscription updated");
                      setEditingId(null);
                    } catch {
                      notify("failed", "Couldn't update subscription");
                    }
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={sub.id}
                className={`flex flex-col gap-4 rounded-3xl border p-5 transition-opacity sm:flex-row sm:items-center sm:justify-between ${
                  sub.active
                    ? "border-neutral-800 bg-neutral-900/60"
                    : "border-neutral-800 bg-neutral-900/30 opacity-80"
                }`}
              >
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-100">{sub.name}</p>
                    <StatusBadge
                      variant={sub.active ? "success" : "pending"}
                      label={sub.active ? "Active" : "Paused"}
                    />
                  </div>
                  <p className="text-sm text-neutral-500">
                    {formatMoney(sub.amountMinor, sub.currency)} / {sub.billingCycle.toLowerCase()}
                    {" · "}next {new Date(sub.nextBillingDate).toLocaleDateString()}
                    {sub.account ? ` · ${sub.account.name}` : " · unlinked"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sub.active && sub.account && (
                    <form
                      action={async () => {
                        try {
                          await markSubscriptionPaid(sub.id);
                          notify("success", "Marked as paid");
                        } catch {
                          notify("failed", "Couldn't record payment");
                        }
                      }}
                    >
                      <Button type="submit" variant="primary" size="sm" icon={<CheckIcon size={13} />}>
                        Mark paid
                      </Button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      try {
                        await toggleSubscriptionActive(sub.id, !sub.active);
                        notify("success", sub.active ? "Subscription paused" : "Subscription resumed");
                      } catch {
                        notify("failed", "Couldn't update subscription");
                      }
                    }}
                  >
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      icon={sub.active ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                    >
                      {sub.active ? "Pause" : "Resume"}
                    </Button>
                  </form>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PencilIcon size={13} />}
                    onClick={() => setEditingId(sub.id)}
                  >
                    Edit
                  </Button>
                  <ConfirmSubmitForm
                    action={async () => {
                      try {
                        await deleteSubscription(sub.id);
                        notify("success", "Subscription deleted");
                      } catch {
                        notify("failed", "Couldn't delete subscription");
                      }
                    }}
                    confirmMessage={`Delete "${sub.name}"?`}
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

function SubscriptionForm({
  accounts,
  currencies,
  subscription,
  onSubmit,
  onCancel,
}: {
  accounts: Account[];
  currencies: readonly Currency[];
  subscription?: Subscription;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel?: () => void;
}) {
  return (
    <form
      action={onSubmit}
      className={
        subscription ? "flex flex-col gap-3" : `flex flex-col gap-3 ${cardClass} p-5`
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input
            name="name"
            required
            defaultValue={subscription?.name}
            placeholder="e.g. Netflix"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={
              subscription ? (subscription.amountMinor / 100).toFixed(2) : undefined
            }
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <CurrencySelect
            currencies={currencies}
            name="currency"
            defaultValue={subscription?.currency}
          />
        </div>
        <div>
          <label className={labelClass}>Billing cycle</label>
          <select
            name="billingCycle"
            defaultValue={subscription?.billingCycle ?? "MONTHLY"}
            className={fieldClass}
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Next billing date</label>
          <input
            name="nextBillingDate"
            type="date"
            required
            defaultValue={
              subscription
                ? toDateInputValue(subscription.nextBillingDate)
                : toDateInputValue(new Date())
            }
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Linked account (optional)</label>
          <select
            name="accountId"
            defaultValue={subscription?.accountId ?? ""}
            className={fieldClass}
          >
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
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
