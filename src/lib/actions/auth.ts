"use server";

import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { createSessionCookie, clearSessionCookie } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return { error: "Server is not configured (APP_PASSWORD missing)" };
  }

  if (typeof password !== "string" || !safeCompare(password, appPassword)) {
    return { error: "Incorrect password" };
  }

  await createSessionCookie();
  redirect("/");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
