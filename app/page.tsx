"use client";

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import LoginPage from "@/components/LoginPage";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Welcome to CrownRing. How may I assist you today?",
};

const AUTH_KEY = "friday_user";

export default function ChatPage() {
  const [user, setUser] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Read persisted session once on mount (must be inside useEffect — localStorage
  // is browser-only and unavailable during SSR/Vercel build)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(stored);
    } catch {
      // localStorage blocked (private browsing restrictions, etc.) — stay logged out
    } finally {
      setAuthReady(true);
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleLogin = (username: string) => {
    localStorage.setItem(AUTH_KEY, username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

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

  // Show login until localStorage has been read client-side.
  // Render LoginPage (not null) so Vercel always shows the dark background — never a blank white screen.
  if (!authReady || !user) return <LoginPage onLogin={handleLogin} />;

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
          </div>

          {/* Right side: online indicator + logout */}
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-slate-500 text-xs hidden sm:block">Online</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-300 text-xs border border-navy-border hover:border-slate-600 rounded-lg px-3 py-1.5 transition-colors duration-150"
            >
              Logout
            </button>
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
