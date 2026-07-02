import type { UIMessage } from "ai";
import { prisma } from "@/lib/prisma";
import ChatPanel from "@/components/assistant/ChatPanel";

const HISTORY_LIMIT = 50;

export default async function AssistantPage() {
  const history = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });

  const initialMessages: UIMessage[] = history.map((m) => ({
    id: m.id,
    role: m.role === "user" ? "user" : "assistant",
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50 light:text-neutral-900">
          Assistant
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ask questions about your money — it can see your real data.
        </p>
      </div>

      <ChatPanel initialMessages={initialMessages} />
    </div>
  );
}
