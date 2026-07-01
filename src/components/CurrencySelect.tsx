import { fieldClass } from "@/lib/ui";

type Currency = { code: string; name: string };

export default function CurrencySelect({
  currencies,
  name,
  defaultValue,
  className,
}: {
  currencies: readonly Currency[];
  name: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "USD"}
      className={className ?? fieldClass}
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
