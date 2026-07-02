import { getSettingsRecord } from "@/lib/data";
import { CURRENCIES } from "@/lib/currency";
import { cardClass } from "@/lib/ui";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettingsRecord();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50 light:text-neutral-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Personalize how your money is displayed.
        </p>
      </div>

      <section className={`${cardClass} p-6`}>
        <h2 className="mb-1 text-sm font-semibold text-neutral-200 light:text-neutral-800">
          Display currency
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          Net worth, spending trends, and account totals on the dashboard are
          converted into this currency using recent exchange rates.
        </p>
        <SettingsForm currencies={CURRENCIES} defaultValue={settings.displayCurrency} />
      </section>
    </div>
  );
}
