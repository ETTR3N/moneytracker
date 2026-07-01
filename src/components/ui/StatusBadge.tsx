"use client";

import { motion } from "motion/react";

export type StatusVariant = "success" | "pending" | "submitted" | "failed";

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  submitted: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  failed: "border-pink-500/30 bg-pink-500/10 text-pink-400",
};

export default function StatusBadge({
  variant,
  label,
  className,
}: {
  variant: StatusVariant;
  label: string;
  className?: string;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -4 }}
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium break-words ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
    >
      <StatusIcon variant={variant} />
      {label}
    </motion.span>
  );
}

function StatusIcon({ variant }: { variant: StatusVariant }) {
  switch (variant) {
    case "success":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <motion.circle
            cx="12"
            cy="12"
            r="9"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <motion.path
            d="M8 12.5l2.5 2.5L16 9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
      );
    case "pending":
      return (
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        >
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </motion.svg>
      );
    case "submitted":
      return (
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: -3, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <rect x="3" y="5" width="14" height="10" rx="2" />
          <path d="M12 8l4 2-4 2" />
        </motion.svg>
      );
    case "failed":
      return (
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -8, 0] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </motion.svg>
      );
  }
}
