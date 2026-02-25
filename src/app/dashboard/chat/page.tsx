"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Headphones,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  Inbox,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────
interface Conversation {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string | null;
  agency_id: string;
  status: "ai" | "live" | "closed";
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender: "client" | "ai" | "agent";
  sender_name: string;
  content: string;
  created_at: string;
}

// ─── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = {
    live: {
      bg: "bg-orange-500/15",
      text: "text-orange-400",
      dot: "bg-orange-400",
      label: "Needs Agent",
    },
    ai: {
      bg: "bg-blue-500/15",
      text: "text-blue-400",
      dot: "bg-blue-400",
      label: "AI Handling",
    },
    closed: {
      bg: "bg-slate-500/15",
      text: "text-slate-400",
      dot: "bg-slate-500",
      label: "Closed",
    },
  }[status] || {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    dot: "bg-slate-500",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
          status === "live" ? "animate-pulse" : ""
        }`}
      />
      {config.label}
    </span>
  );
}

// ─── Time Ago ──────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Main Chat Inbox Page ──────────────────────────────────
export default function ChatInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "live" | "ai" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get agency session
  const getAgencyId = useCallback(() => {
    try {
      const raw = localStorage.getItem("agency_session");
      if (!raw) return null;
      const session = JSON.parse(raw);
      return session.agency_id || session.id || null;
    } catch {
      return null;
    }
  }, []);

  // Fetch conversations
  const loadConversations = useCallback(async () => {
    const agencyId = getAgencyId();
    if (!agencyId) return;

    try {
      const statusParam =
        filter !== "all" ? `&status=${filter}` : "";
      const res = await fetch(
        `/api/chat/conversations?agency_id=${agencyId}${statusParam}`
      );
      const json = await res.json();
      setConversations(json.conversations || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [getAgencyId, filter]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(
        `/api/chat/messages?conversation_id=${convId}`
      );
      const json = await res.json();
      setMessages(json.messages || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      const interval = setInterval(() => loadMessages(selectedConv.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when selecting conversation
  useEffect(() => {
    if (selectedConv) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConv]);

  // Send agent reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv) return;

    setSending(true);
    try {
      const agencySession = JSON.parse(
        localStorage.getItem("agency_session") || "{}"
      );
      const agentName =
        agencySession.name || agencySession.agency_name || "Support Agent";

      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConv.id,
          sender: "agent",
          sender_name: agentName,
          content: replyText.trim(),
        }),
      });

      setReplyText("");
      await loadMessages(selectedConv.id);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  // Close conversation
  const closeConversation = async (convId: string) => {
    try {
      await fetch("/api/chat/conversations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: convId, status: "closed" }),
      });
      await loadConversations();
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch {
      // ignore
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.client_name?.toLowerCase().includes(q) ||
      c.client_email?.toLowerCase().includes(q) ||
      c.client_id?.toLowerCase().includes(q)
    );
  });

  const liveCount = conversations.filter((c) => c.status === "live").length;

  return (
    <div className="flex-1 overflow-hidden pt-6 pr-6 pb-6 pl-6">
      <div className="h-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Chat Inbox</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage client support conversations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {liveCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-medium text-orange-400">
                  {liveCount} waiting for agent
                </span>
              </div>
            )}
            <button
              onClick={loadConversations}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0 bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
          {/* Conversations List */}
          <div className="w-[340px] border-r border-white/5 flex flex-col">
            {/* Search & Filter */}
            <div className="p-3 border-b border-white/5 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-[#13161C] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600"
                />
              </div>
              <div className="flex gap-1">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "live", label: "Needs Agent" },
                    { id: "ai", label: "AI" },
                    { id: "closed", label: "Closed" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                      filter === f.id
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Inbox className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-500">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full px-3 py-3 border-b border-white/5 text-left hover:bg-white/5 transition-colors ${
                      selectedConv?.id === conv.id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white truncate max-w-[160px]">
                        {conv.client_name}
                      </span>
                      <StatusBadge status={conv.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {conv.client_email || conv.client_id}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {timeAgo(conv.updated_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedConv.client_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedConv.client_email || selectedConv.client_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedConv.status} />
                    {selectedConv.status !== "closed" && (
                      <button
                        onClick={() => closeConversation(selectedConv.id)}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${
                        msg.sender === "agent" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                          msg.sender === "client"
                            ? "bg-blue-600/20"
                            : msg.sender === "agent"
                            ? "bg-green-600/20"
                            : "bg-slate-700/50"
                        }`}
                      >
                        {msg.sender === "client" ? (
                          <User className="w-3.5 h-3.5 text-blue-400" />
                        ) : msg.sender === "agent" ? (
                          <Headphones className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div
                        className={`max-w-[70%] rounded-xl px-3.5 py-2.5 ${
                          msg.sender === "agent"
                            ? "bg-green-600/15 border border-green-500/20"
                            : msg.sender === "client"
                            ? "bg-blue-600/15 border border-blue-500/20"
                            : "bg-[#1A1D25] border border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-medium ${
                              msg.sender === "agent"
                                ? "text-green-400"
                                : msg.sender === "client"
                                ? "text-blue-400"
                                : "text-slate-500"
                            }`}
                          >
                            {msg.sender_name}
                          </span>
                          <span className="text-[9px] text-slate-600">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                {selectedConv.status !== "closed" && (
                  <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                        placeholder="Type your reply..."
                        className="flex-1 bg-[#13161C] border border-white/10 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                      >
                        {sending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Select a conversation to view
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Conversations from clients will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
