"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";

export default function AgentLogin({
  onSignIn,
  error,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  error: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    await onSignIn(String(fd.get("email") ?? ""), String(fd.get("password") ?? "")).catch(() => {});
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900">Sales console</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sign in to answer live chats.</p>
        </div>

        <div>
          <label htmlFor="agent-email" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Email
          </label>
          <input
            required
            id="agent-email"
            name="email"
            type="email"
            autoComplete="username"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="agent-password" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            required
            id="agent-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Sign in</>}
        </button>
      </form>
    </div>
  );
}
