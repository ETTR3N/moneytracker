"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

type MonthPoint = { key: string; label: string; amountMinor: number };

type Tab = {
  id: string;
  label: string;
  data: MonthPoint[];
  color: string;
};

function formatAxis(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

type TooltipContentProps = {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
  currency: string;
  color: string;
};

function CustomTooltip({ active, payload, label, currency, color }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);

  return (
    <div
      className="rounded-2xl px-4 py-3 text-neutral-950 shadow-xl"
      style={{ backgroundColor: color }}
    >
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold tabular-nums">
        {new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(value)}
      </p>
    </div>
  );
}

export default function ChartCard({
  currency,
  netWorthByMonth,
  spendingByMonth,
}: {
  currency: string;
  netWorthByMonth: MonthPoint[];
  spendingByMonth: MonthPoint[];
}) {
  const tabs: Tab[] = [
    { id: "networth", label: "Net worth", data: netWorthByMonth, color: "#34d399" },
    { id: "spending", label: "Spending", data: spendingByMonth, color: "#fb7185" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const chartData = tab.data.map((d) => ({ label: d.label, amount: d.amountMinor / 100 }));
  const gradientId = `chart-gradient-${tab.id}`;
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#262626" : "#e5e5e5";
  const axisColor = theme === "dark" ? "#737373" : "#a3a3a3";

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-6 light:border-neutral-200 light:bg-white">
      <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 p-1 light:border-neutral-200 light:bg-neutral-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="relative rounded-full px-4 py-1.5 text-sm font-medium"
          >
            {activeTab === t.id && (
              <motion.span
                layoutId="chart-tab-pill"
                className="absolute inset-0 rounded-full bg-neutral-100 light:bg-neutral-900"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 ${
                activeTab === t.id
                  ? "text-neutral-950 light:text-white"
                  : "text-neutral-400 light:text-neutral-500"
              }`}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tab.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={tab.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatAxis(v, currency)}
                width={48}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} color={tab.color} />}
                cursor={{ stroke: tab.color, strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={tab.color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
