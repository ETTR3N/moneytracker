"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { toMinorUnits } from "@/lib/money";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/subscriptions");
}

export async function createAccount(formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const startingBalance = toMinorUnits(
    String(formData.get("startingBalance") ?? "0")
  );

  if (!name || !currency) return;

  await prisma.account.create({
    data: { name, currency, startingBalance },
  });

  revalidateAll();
}

export async function updateAccount(id: string, formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();

  if (!name || !currency) return;

  await prisma.account.update({
    where: { id },
    data: { name, currency },
  });

  revalidateAll();
}

export async function deleteAccount(id: string) {
  await requireAuth();
  await prisma.account.delete({ where: { id } });
  revalidateAll();
}
