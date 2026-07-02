"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { logout } from "@/lib/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/subscriptions", label: "Subscriptions" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur light:border-neutral-200 light:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-neutral-950">
              M
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-neutral-100 sm:inline light:text-neutral-900">
              Money Tracker
            </span>
          </Link>

          <div className="no-scrollbar min-w-0 overflow-x-auto">
            <nav className="flex w-max items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 p-1 light:border-neutral-200 light:bg-neutral-100">
              {LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap sm:px-3.5"
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-white light:bg-neutral-900"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        active
                          ? "text-neutral-950 light:text-white"
                          : "text-neutral-400 hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              pathname === "/settings"
                ? "border-neutral-500 bg-neutral-800 text-neutral-100 light:border-neutral-400 light:bg-neutral-200 light:text-neutral-900"
                : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-100 light:border-neutral-300 light:text-neutral-500 light:hover:border-neutral-400 light:hover:text-neutral-900"
            }`}
            aria-label="Settings"
          >
            <SettingsIcon />
          </Link>
          <form action={logout}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-100 light:border-neutral-300 light:text-neutral-500 light:hover:border-neutral-400 light:hover:text-neutral-900"
              aria-label="Log out"
            >
              <LogoutIcon />
            </motion.button>
          </form>
        </div>
      </div>
    </header>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
