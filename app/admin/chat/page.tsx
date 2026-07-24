"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useAgentAuth } from "@/lib/chat/useAgentAuth";
import { useInbox, useClosedInbox, useVisitorsPresence } from "@/lib/chat/useInbox";
import { useTeamHeartbeat } from "@/lib/chat/useTeamHeartbeat";
import AgentLogin from "@/components/admin/chat/AgentLogin";
import ConversationList from "@/components/admin/chat/ConversationList";
import ChatThread from "@/components/admin/chat/ChatThread";
import InboxTabs, { type TabKey } from "@/components/admin/chat/InboxTabs";

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

  return <Console email={user.email ?? ""} onSignOut={signOutAgent} />;
}

function Console({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const { conversations: open, error } = useInbox();
  const [tab, setTab] = useState<TabKey>("open");
  const { conversations: closed, error: closedError } = useClosedInbox(tab === "closed");

  const noReply = open.filter((c) => c.needsFollowUp);
  const visible = tab === "open" ? open : tab === "noreply" ? noReply : closed;
  const presenceMap = useVisitorsPresence(visible.map((c) => c.visitorId));

  const counts = {
    open: open.length,
    noreply: noReply.length,
    closed: tab === "closed" ? closed.length : null,
  };

  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("c") : null
  );

  useTeamHeartbeat(true);

  const unread = open.reduce((n, c) => n + (c.unreadForAgent > 0 ? 1 : 0), 0);
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Sales console` : "Sales console";
  }, [unread]);

  const selected = [...open, ...closed].find((c) => c.id === selectedId) ?? null;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <span className="font-bold text-sm text-gray-900">Sales console</span>
        <span className="flex-1 text-xs text-gray-400 truncate">{email}</span>
        <button
          onClick={() => void onSignOut()}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>

      {(error || closedError) && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 border-b border-red-200 px-4 py-2">
          {error || closedError}
        </p>
      )}

      <div className="flex-1 min-h-0 flex">
        <aside
          className={`${
            selected ? "hidden md:flex" : "flex"
          } w-full flex-col md:w-80 lg:w-96 shrink-0 border-r border-gray-200 bg-white`}
        >
          <InboxTabs active={tab} onChange={setTab} counts={counts} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={visible}
              selectedId={selectedId}
              onSelect={setSelectedId}
              presenceMap={presenceMap}
              emptyLabel={
                tab === "open"
                  ? "No open chats."
                  : tab === "noreply"
                  ? "Nothing waiting on a reply."
                  : "No closed chats."
              }
            />
          </div>
        </aside>

        <div className={`${selected ? "block" : "hidden md:block"} flex-1 min-w-0`}>
          {selected ? (
            <ChatThread conversation={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Select a conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
