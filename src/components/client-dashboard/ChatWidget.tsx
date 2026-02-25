"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Headphones,
  ArrowRight,
  Loader2,
  Minimize2,
  ChevronDown,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: "client" | "ai" | "agent";
  sender_name: string;
  content: string;
  created_at: string;
  link?: { label: string; href: string };
}

interface FAQResult {
  question: string;
  answer: string;
  category: string;
  score: number;
  link?: { label: string; href: string };
}

// ─── Chat Widget ───────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "live" | "waiting">("ai");
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hadNoMatch, setHadNoMatch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get client session
  const getSession = useCallback(() => {
    try {
      const raw = localStorage.getItem("client_session");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Poll for new messages in live mode
  useEffect(() => {
    if (mode === "live" && conversationId && isOpen) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/chat/messages?conversation_id=${conversationId}`
          );
          const json = await res.json();
          if (json.messages && json.messages.length > messages.length) {
            setMessages(
              json.messages.map((m: Record<string, unknown>) => ({
                id: m.id as string,
                sender: m.sender as "client" | "ai" | "agent",
                sender_name: m.sender_name as string,
                content: m.content as string,
                created_at: m.created_at as string,
              }))
            );
          }
        } catch {
          // Polling error — ignore
        }
      }, 3000);
      setPollInterval(interval);
      return () => clearInterval(interval);
    } else if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, conversationId, isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const session = getSession();
      const name = session?.client_name?.split(" ")[0] || "there";
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          sender_name: "AI Assistant",
          content: `Hi ${name}! I'm your AI assistant. I can help answer questions about our service using our knowledge base. Just type your question below!\n\nIf I can't find the answer, I'll connect you with a live support agent.`,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length, getSession]);

  // ─── Create conversation in Supabase ─────────────────────
  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;

    const session = getSession();
    if (!session) return null;

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: session.client_id,
          client_name: session.client_name || "Unknown",
          client_email: session.client_email || null,
          agency_id: session.agency_id,
        }),
      });
      const json = await res.json();
      if (json.conversation?.id) {
        setConversationId(json.conversation.id);
        return json.conversation.id as string;
      }
    } catch {
      // Failed to create conversation
    }
    return null;
  }, [conversationId, getSession]);

  // ─── Save message to Supabase ────────────────────────────
  const saveMessage = useCallback(
    async (
      convId: string,
      sender: "client" | "ai" | "agent",
      senderName: string,
      content: string
    ) => {
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: convId,
            sender,
            sender_name: senderName,
            content,
          }),
        });
      } catch {
        // Non-blocking
      }
    },
    []
  );

  // ─── Request live agent ──────────────────────────────────
  const requestLiveAgent = useCallback(
    async (question?: string) => {
      setMode("waiting");

      const convId = await ensureConversation();
      const session = getSession();

      // Update conversation status to "live"
      if (convId) {
        await fetch("/api/chat/conversations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: convId,
            status: "live",
          }),
        });
      }

      // Send Slack notification
      if (session?.agency_id) {
        fetch("/api/chat/slack-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agency_id: session.agency_id,
            client_name: session.client_name,
            client_email: session.client_email,
            question: question || "Client requested live support",
            conversation_id: convId,
          }),
        }).catch(() => {});
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          sender: "ai",
          sender_name: "System",
          content:
            "You've been connected to our live support queue. A support agent will be with you shortly. You can continue typing messages and they'll see everything when they join.",
          created_at: new Date().toISOString(),
        },
      ]);

      if (convId) {
        await saveMessage(
          convId,
          "ai",
          "System",
          "Client requested live support. Waiting for an agent."
        );
      }

      setMode("live");
    },
    [ensureConversation, getSession, saveMessage]
  );

  // ─── Handle sending a message ────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const session = getSession();
    const clientName = session?.client_name || "You";

    // Add client message to UI
    const clientMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: "client",
      sender_name: clientName,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, clientMsg]);
    setInputValue("");

    // Save to Supabase if in live mode
    if (mode === "live") {
      const convId = await ensureConversation();
      if (convId) {
        await saveMessage(convId, "client", clientName, text);
      }
      return;
    }

    // ─── AI mode: search FAQ ─────────────────────────────
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const json = await res.json();

      if (json.found && json.results?.length > 0) {
        const top: FAQResult = json.results[0];

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          sender_name: "AI Assistant",
          content: top.answer,
          created_at: new Date().toISOString(),
          link: top.link,
        };
        setMessages((prev) => [...prev, aiMsg]);

        // If there are more results, show them as suggestions
        if (json.results.length > 1) {
          const suggestions = json.results
            .slice(1)
            .map((r: FAQResult) => `• ${r.question}`)
            .join("\n");
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-suggestions-${Date.now()}`,
              sender: "ai",
              sender_name: "AI Assistant",
              content: `You might also be interested in:\n${suggestions}`,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        // Save to conversation if exists
        const convId = await ensureConversation();
        if (convId) {
          await saveMessage(convId, "client", clientName, text);
          await saveMessage(convId, "ai", "AI Assistant", top.answer);
        }
      } else {
        // No match — offer live agent
        setHadNoMatch(true);
        const noMatchMsg: ChatMessage = {
          id: `ai-nomatch-${Date.now()}`,
          sender: "ai",
          sender_name: "AI Assistant",
          content:
            json.message ||
            "I couldn't find an answer to your question in our knowledge base. Would you like to speak with a live support agent?",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, noMatchMsg]);

        const convId = await ensureConversation();
        if (convId) {
          await saveMessage(convId, "client", clientName, text);
          await saveMessage(
            convId,
            "ai",
            "AI Assistant",
            "Could not find answer in knowledge base. Offered live agent."
          );
        }
      }
    } catch {
      setHadNoMatch(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "ai",
          sender_name: "AI Assistant",
          content:
            "Sorry, I'm having trouble searching right now. Would you like to connect with a live agent instead?",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, mode, getSession, ensureConversation, saveMessage]);

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-[#0D1017] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#13161C] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                {mode === "live" ? (
                  <Headphones className="w-4 h-4 text-blue-400" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {mode === "live" ? "Live Support" : "AI Assistant"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {mode === "live"
                    ? "Connected to support team"
                    : "Powered by your knowledge base"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Mode Indicator */}
          {mode === "live" && (
            <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-green-400 font-medium">
                Live agent support active
              </span>
            </div>
          )}
          {mode === "waiting" && (
            <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
              <span className="text-[11px] text-yellow-400 font-medium">
                Connecting to support agent...
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "client" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
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

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                    msg.sender === "client"
                      ? "bg-blue-600 text-white"
                      : msg.sender === "agent"
                      ? "bg-green-600/15 border border-green-500/20 text-slate-200"
                      : "bg-[#1A1D25] border border-white/5 text-slate-300"
                  }`}
                >
                  {msg.sender !== "client" && (
                    <p
                      className={`text-[10px] font-medium mb-1 ${
                        msg.sender === "agent"
                          ? "text-green-400"
                          : "text-slate-500"
                      }`}
                    >
                      {msg.sender_name}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.link && (
                    <a
                      href={msg.link.href}
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {msg.link.label}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="bg-[#1A1D25] border border-white/5 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Live Agent Request Button (only visible after AI fails to find an answer) */}
          {mode === "ai" && hadNoMatch && (
            <div className="px-4 pb-2">
              <button
                onClick={() => requestLiveAgent()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs text-slate-300"
              >
                <Headphones className="w-3.5 h-3.5" />
                Talk to a live agent
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 bg-[#13161C] border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  mode === "live"
                    ? "Type a message to your agent..."
                    : "Ask a question..."
                }
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-1.5">
              {mode === "ai"
                ? "AI searches your knowledge base only"
                : "Messages are sent to your support team"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
