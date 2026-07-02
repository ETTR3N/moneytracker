"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { login } from "@/lib/actions/auth";
import { fieldClass } from "@/lib/ui";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { LockOpenIcon } from "@/components/ui/icons";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 light:bg-neutral-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(52,211,153,0.16),transparent)] light:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]"
      />
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        action={formAction}
        className="relative w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur light:border-neutral-200 light:bg-white/90"
      >
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-neutral-950">
          M
        </span>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-50 light:text-neutral-900">
          Money Tracker
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          Enter your password to continue.
        </p>
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Password"
          className={`mb-3 ${fieldClass}`}
        />
        {state?.error && (
          <div className="mb-3">
            <StatusBadge variant="failed" label={state.error} />
          </div>
        )}
        <Button type="submit" variant="primary" icon={<LockOpenIcon size={14} />} className="w-full">
          Unlock
        </Button>
      </motion.form>
    </div>
  );
}
