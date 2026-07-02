"use client";

import { useFormStatus } from "react-dom";
import { motion, type HTMLMotionProps } from "motion/react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-white text-neutral-950 hover:bg-neutral-200 light:bg-neutral-900 light:text-white light:hover:bg-neutral-700",
  secondary:
    "border border-neutral-700 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800 light:border-neutral-300 light:text-neutral-700 light:hover:border-neutral-400 light:hover:bg-neutral-100",
  ghost:
    "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 light:text-neutral-500 light:hover:bg-neutral-100 light:hover:text-neutral-900",
  danger:
    "border border-red-900/60 text-red-400 hover:border-red-700 hover:bg-red-950/60 light:border-red-300 light:text-red-600 light:hover:border-red-400 light:hover:bg-red-50",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  size?: keyof typeof SIZE_CLASSES;
  icon?: React.ReactNode;
  children?: React.ReactNode;
};

function Spinner() {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </motion.svg>
  );
}

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus();
  const isSubmitPending = props.type === "submit" && pending;
  const disabled = props.disabled || isSubmitPending;

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ""}`}
      {...props}
    >
      {isSubmitPending ? <Spinner /> : icon}
      {children}
    </motion.button>
  );
}
