"use client";

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Friday, CrownRing's jewelry assistant. Ask me anything about our collections, materials, sizing, or care guides.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://crownring.app.n8n.cloud/webhook/friday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.ok
          ? data.answer
          : "Sorry, I'm having trouble connecting. Please try again.",
        isError: !res.ok,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-navy">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-navy-border bg-navy-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center shadow-[0_0_12px_rgba(201,168,76,0.15)]">
            <span className="text-gold font-semibold text-sm tracking-widest">
              CR
            </span>
          </div>

          <div>
            <h1 className="text-white font-semibold text-base leading-tight tracking-wide">
              CrownRing
            </h1>
            <p className="text-gold/80 text-xs font-light tracking-widest uppercase">
              Friday — Jewelry Assistant
            </p>
          </div>

          {/* Online indicator */}
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-slate-500 text-xs">Online</span>
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── Input Bar ── */}
      <footer className="flex-shrink-0 border-t border-navy-border bg-navy-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3 bg-navy-surface border border-navy-border rounded-2xl px-4 py-3 focus-within:border-gold/40 transition-colors duration-200">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about rings, sizing, materials…"
              disabled={isLoading}
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 text-sm resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ height: "24px" }}
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gold flex items-center justify-center text-navy-DEFAULT font-bold shadow-md hover:bg-gold-light active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <SendIcon />
            </button>
          </div>

          <p className="text-center text-slate-700 text-xs mt-2">
            Friday can make mistakes. Verify important details with our team.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  );
}
