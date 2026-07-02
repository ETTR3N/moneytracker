"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion } from "motion/react";
import { cardClass, fieldClass } from "@/lib/ui";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { SparkleIcon, SendIcon } from "@/components/ui/icons";
import Markdown from "@/components/assistant/Markdown";

const SUGGESTIONS = [
  "How much am I spending each month?",
  "Are any of my subscriptions worth cancelling?",
  "How is my net worth trending?",
  "Where could I realistically cut back?",
];

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function ChatPanel({ initialMessages }: { initialMessages: UIMessage[] }) {
  const { messages, sendMessage, status, error } = useChat({ messages: initialMessages });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className={`flex h-[calc(100vh-220px)] min-h-[420px] flex-col ${cardClass} overflow-hidden`}>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <SparkleIcon size={22} />
            </span>
            <div>
              <p className="font-medium text-neutral-100 light:text-neutral-900">
                Ask me about your money
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                I can see your accounts, spending, and subscriptions.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100 light:border-neutral-300 light:bg-white light:text-neutral-600 light:hover:border-neutral-400 light:hover:text-neutral-900"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[75%] ${
                    message.role === "user"
                      ? "whitespace-pre-wrap bg-white text-neutral-950 light:bg-neutral-900 light:text-white"
                      : "border border-neutral-800 bg-neutral-900/60 text-neutral-200 light:border-neutral-200 light:bg-neutral-100 light:text-neutral-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    messageText(message) ? (
                      <Markdown text={messageText(message)} />
                    ) : isBusy ? (
                      "…"
                    ) : null
                  ) : (
                    messageText(message)
                  )}
                </div>
              </motion.div>
            ))}
            {status === "submitted" && (
              <div className="flex justify-start">
                <StatusBadge variant="pending" label="Thinking" />
              </div>
            )}
            {status === "error" && (
              <div className="flex justify-start">
                <StatusBadge variant="failed" label={error?.message || "Something went wrong"} />
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-end gap-2 border-t border-neutral-800 p-3 light:border-neutral-200 sm:p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          rows={1}
          placeholder="Ask about your spending, accounts, subscriptions…"
          className={`max-h-32 min-h-[42px] flex-1 resize-none ${fieldClass}`}
        />
        <Button type="submit" variant="primary" icon={<SendIcon size={14} />} disabled={isBusy || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
