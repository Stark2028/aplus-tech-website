"use client";

import { useAgentAuth } from "@/lib/chat/useAgentAuth";
import AgentLogin from "@/components/admin/chat/AgentLogin";
import { Loader2 } from "lucide-react";

export default function AdminChatPage() {
  const { ready, user, isAgent, signIn, signOutAgent, error } = useAgentAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (!user) return <AgentLogin onSignIn={signIn} error={error} />;

  // Signed in but not an agent. The rules already refuse them everything — this
  // just explains why the console is empty instead of showing a wall of errors.
  if (!isAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <p className="text-sm text-gray-800 font-semibold">This account is not a sales agent.</p>
          <p className="text-xs text-gray-500">
            Ask an administrator to grant access, then sign out and back in.
          </p>
          <button
            onClick={signOutAgent}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Task 23 replaces this with the inbox.
  return <div className="p-6 text-sm text-gray-500">Signed in as {user.email}. Inbox coming next.</div>;
}
