"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { toMinorUnits } from "@/lib/money";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
}

export async function createTransaction(formData: FormData) {
  await requireAuth();

  const accountId = String(formData.get("accountId") ?? "");
  const type = String(formData.get("type") ?? "expense");
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const dateInput = String(formData.get("date") ?? "");
  const amountAbs = Math.abs(toMinorUnits(String(formData.get("amount") ?? "0")));

  if (!accountId || !dateInput || amountAbs === 0) return;

  const amountMinor = type === "income" ? amountAbs : -amountAbs;

  await prisma.transaction.create({
    data: {
      accountId,
      amountMinor,
      description,
      category,
      date: new Date(dateInput),
    },
  });

  revalidateAll();
}

export async function updateTransaction(id: string, formData: FormData) {
  await requireAuth();

  const type = String(formData.get("type") ?? "expense");
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const dateInput = String(formData.get("date") ?? "");
  const amountAbs = Math.abs(toMinorUnits(String(formData.get("amount") ?? "0")));

  if (!dateInput || amountAbs === 0) return;

  const amountMinor = type === "income" ? amountAbs : -amountAbs;

  await prisma.transaction.update({
    where: { id },
    data: { amountMinor, description, category, date: new Date(dateInput) },
  });

  revalidateAll();
}

export async function deleteTransaction(id: string) {
  await requireAuth();
  await prisma.transaction.delete({ where: { id } });
  revalidateAll();
}
