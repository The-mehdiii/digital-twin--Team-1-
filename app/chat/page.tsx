"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

type ErrorState = {
  message: string;
  retryAfter?: number;
  canRetry?: boolean;
} | null;

type LastRequest = { messages: Message[]; conversationId?: string } | null;

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const messageIdRef = useRef(1);
  const [lastRequest, setLastRequest] = useState<LastRequest>(null);

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, router]);

  // Auto-dismiss error after 10s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 10000);
    return () => clearTimeout(t);
  }, [error]);

  const sendMessage = useCallback(async (userMessage: Message, allMessages: Message[], conversationId?: string) => {
    setIsLoading(true);
    setError(null);
    setLastRequest({ messages: allMessages, conversationId });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, conversationId, system: SYSTEM_PROMPT }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError({ message: data.error || "Too many requests.", retryAfter: data.retryAfter, canRetry: true });
        } else if (res.status === 503 || res.status === 504) {
          setError({ message: data.error || "Service unavailable.", canRetry: true });
        } else {
          setError({ message: data.error || "Something went wrong.", canRetry: false });
        }
        return;
      }

      const assistantMessage: Message = { id: `${messageIdRef.current++}`, role: "assistant", content: data.content };
      setMessages((p) => [...p, assistantMessage]);
      setLastRequest(null);
    } catch (err) {
      console.error("Chat error:", err);
      setError({ message: "Network error. Please check your connection.", canRetry: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (!lastRequest) return;
    const lastUser = lastRequest.messages[lastRequest.messages.length - 1];
    if (lastUser) sendMessage(lastUser, lastRequest.messages, lastRequest.conversationId);
  }, [lastRequest, sendMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    let currentConversationId = activeConversationId;
    if (messages.length === 0) {
      const newConvId = Date.now().toString();
      currentConversationId = newConvId;
      const newConversation: Conversation = { id: newConvId, title: input.substring(0, 30), timestamp: new Date().toLocaleTimeString() };
      setConversations((p) => [newConversation, ...p]);
      setActiveConversationId(newConvId);
    }

    const userMessage: Message = { id: `${messageIdRef.current++}`, role: "user", content: input };
    const all = [...messages, userMessage];
    setMessages(all);
    setInput("");
    await sendMessage(userMessage, all, currentConversationId);
  };

  const handleNewChat = () => { setMessages([]); setInput(""); setActiveConversationId(undefined); setError(null); setLastRequest(null); };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={(id) => setActiveConversationId(id)}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        <header style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>Mehdi's Digital Twin</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "4px 0 0 0" }}>Ask me anything about web development, projects, or collaborations</p>
        </header>

        {error && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, background: "linear-gradient(135deg,#450a0a,#7f1d1d)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", maxWidth: 400 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <AlertCircle size={20} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fecaca", fontSize: 14, margin: 0 }}>{error.message}</p>
                {error.retryAfter && <p style={{ color: "#fca5a5", fontSize: 12, margin: "4px 0 0 0" }}>Try again in {error.retryAfter} seconds</p>}
                {error.canRetry && lastRequest && (
                  <button onClick={handleRetry} disabled={isLoading} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 12px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#fecaca", fontSize: 13 }}>
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Retry
                  </button>
                )}
              </div>
              <button onClick={() => setError(null)} style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}><X size={16} /></button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto" }}>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", flexShrink: 0, background: "rgba(0,0,0,0.2)" }}>
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
