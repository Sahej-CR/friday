"use client";

import { FormEvent, useState } from "react";

const CREDENTIALS: Record<string, string> = {
  sahej: "crownring1",
  user2: "crownring2",
  user3: "crownring3",
};

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (CREDENTIALS[username] === password) {
      onLogin(username);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-navy-card border border-navy-border rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center shadow-[0_0_16px_rgba(201,168,76,0.15)] mb-4">
            <span className="text-gold font-semibold tracking-widest">CR</span>
          </div>
          <h1 className="text-white font-semibold text-lg tracking-wide">
            CrownRing
          </h1>
          <p className="text-gold/70 text-xs font-light tracking-widest uppercase mt-1">
            Friday — Jewelry Assistant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-navy-surface border border-navy-border rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-gold/40 transition-colors placeholder-slate-600"
              placeholder="Enter username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-navy-surface border border-navy-border rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-gold/40 transition-colors placeholder-slate-600"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 bg-gold text-navy-DEFAULT font-semibold text-sm rounded-xl py-3 hover:bg-gold-light active:scale-[0.98] transition-all duration-150 shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
