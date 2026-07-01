"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function updateDisplayCurrency(formData: FormData) {
  await requireAuth();

  const displayCurrency = String(formData.get("displayCurrency") ?? "USD");

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { displayCurrency },
    create: { id: "singleton", displayCurrency },
  });

  revalidatePath("/");
  revalidatePath("/settings");
}
