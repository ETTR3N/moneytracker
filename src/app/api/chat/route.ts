import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { isAuthenticated } from "@/lib/session";
import { buildFinancialContext, ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai-context";
import { prisma } from "@/lib/prisma";

function textFromMessage(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastUserMessage = messages[messages.length - 1];
  if (lastUserMessage?.role === "user") {
    const text = textFromMessage(lastUserMessage);
    if (text) {
      await prisma.chatMessage.create({ data: { role: "user", content: text } });
    }
  }

  const financialContext = await buildFinancialContext();
  const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const result = streamText({
    model: google(modelId),
    system: `${ASSISTANT_SYSTEM_PROMPT}\n\n--- CURRENT FINANCIAL DATA ---\n${financialContext}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages: finalMessages }) => {
      const text = textFromMessage(finalMessages[finalMessages.length - 1]);
      if (text) {
        await prisma.chatMessage.create({ data: { role: "assistant", content: text } });
      }
    },
  });
}
