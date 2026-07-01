"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { toMinorUnits, advanceBillingDate } from "@/lib/money";
import { getRates, convertMinor } from "@/lib/currency";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/subscriptions");
  revalidatePath("/transactions");
}

export async function createSubscription(formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const billingCycle = String(formData.get("billingCycle") ?? "MONTHLY");
  const nextBillingDateInput = String(formData.get("nextBillingDate") ?? "");
  const accountId = String(formData.get("accountId") ?? "") || null;
  const amountMinor = Math.abs(
    toMinorUnits(String(formData.get("amount") ?? "0"))
  );

  if (!name || !currency || !nextBillingDateInput || amountMinor === 0) return;

  await prisma.subscription.create({
    data: {
      name,
      currency,
      amountMinor,
      billingCycle,
      nextBillingDate: new Date(nextBillingDateInput),
      accountId,
    },
  });

  revalidateAll();
}

export async function updateSubscription(id: string, formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const billingCycle = String(formData.get("billingCycle") ?? "MONTHLY");
  const nextBillingDateInput = String(formData.get("nextBillingDate") ?? "");
  const accountId = String(formData.get("accountId") ?? "") || null;
  const amountMinor = Math.abs(
    toMinorUnits(String(formData.get("amount") ?? "0"))
  );

  if (!name || !currency || !nextBillingDateInput || amountMinor === 0) return;

  await prisma.subscription.update({
    where: { id },
    data: {
      name,
      currency,
      amountMinor,
      billingCycle,
      nextBillingDate: new Date(nextBillingDateInput),
      accountId,
    },
  });

  revalidateAll();
}

export async function toggleSubscriptionActive(id: string, active: boolean) {
  await requireAuth();
  await prisma.subscription.update({ where: { id }, data: { active } });
  revalidateAll();
}

export async function deleteSubscription(id: string) {
  await requireAuth();
  await prisma.subscription.delete({ where: { id } });
  revalidateAll();
}

export async function markSubscriptionPaid(id: string) {
  await requireAuth();

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!subscription || !subscription.account) return;

  const rates = await getRates();
  const amountInAccountCurrency = convertMinor(
    subscription.amountMinor,
    subscription.currency,
    subscription.account.currency,
    rates
  );

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId: subscription.account.id,
        amountMinor: -Math.abs(amountInAccountCurrency),
        description: `${subscription.name} subscription`,
        category: "Subscription",
        date: new Date(),
        subscriptionId: subscription.id,
      },
    }),
    prisma.subscription.update({
      where: { id },
      data: {
        nextBillingDate: advanceBillingDate(
          subscription.nextBillingDate,
          subscription.billingCycle
        ),
      },
    }),
  ]);

  revalidateAll();
}
