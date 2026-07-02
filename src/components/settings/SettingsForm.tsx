"use client";

import { updateDisplayCurrency } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/ToastProvider";
import { labelClass } from "@/lib/ui";
import CurrencySelect from "@/components/CurrencySelect";
import Button from "@/components/ui/Button";
import { SaveIcon } from "@/components/ui/icons";

type Currency = { code: string; name: string };

export default function SettingsForm({
  currencies,
  defaultValue,
}: {
  currencies: readonly Currency[];
  defaultValue: string;
}) {
  const notify = useToast();

  return (
    <form
      action={async (formData) => {
        try {
          await updateDisplayCurrency(formData);
          notify("success", "Settings saved");
        } catch {
          notify("failed", "Couldn't save settings");
        }
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-full sm:w-56">
        <label className={labelClass}>Currency</label>
        <CurrencySelect
          key={defaultValue}
          currencies={currencies}
          name="displayCurrency"
          defaultValue={defaultValue}
        />
      </div>
      <Button type="submit" variant="primary" icon={<SaveIcon size={14} />}>
        Save
      </Button>
    </form>
  );
}
