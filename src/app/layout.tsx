import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ToastProvider from "@/components/ui/ToastProvider";
import { isAuthenticated } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Personal money and subscriptions tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await isAuthenticated();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-neutral-950 text-neutral-100">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(52,211,153,0.16),transparent)]"
        />
        <ToastProvider>
          {authed && <Nav />}
          <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
