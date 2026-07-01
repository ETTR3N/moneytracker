"use client";

import { motion } from "motion/react";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import Sparkline from "@/components/dashboard/Sparkline";

export default function StatCard({
  label,
  value,
  currency,
  color,
  sparkline,
  index = 0,
}: {
  label: string;
  value: number;
  currency: string;
  color: string;
  sparkline?: number[];
  index?: number;
}) {
  const formatter = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <AnimatedNumber
        value={value}
        formatter={formatter}
        className="mt-2 block text-2xl font-bold tracking-tight text-neutral-50 tabular-nums"
      />
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 -mb-1">
          <Sparkline data={sparkline} color={color} />
        </div>
      )}
    </motion.div>
  );
}
