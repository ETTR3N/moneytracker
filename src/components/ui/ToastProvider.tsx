"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import StatusBadge, { type StatusVariant } from "@/components/ui/StatusBadge";

type Toast = { id: number; variant: StatusVariant; label: string };
type NotifyFn = (variant: StatusVariant, label: string) => void;

const ToastContext = createContext<NotifyFn | null>(null);

export function useToast(): NotifyFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback<NotifyFn>((variant, label) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, variant, label }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 flex-col items-center gap-2 sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm sm:translate-x-0 sm:items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <StatusBadge
              key={toast.id}
              variant={toast.variant}
              label={toast.label}
              className="pointer-events-auto max-w-full bg-neutral-950 shadow-lg shadow-black/40"
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
