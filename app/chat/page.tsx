"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { AlertCircle, X } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  // RAG sources returned from the API via X-RAG-Sources header
  const [ragSources, setRagSources] = useState<{ filename: string; score: number }[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // Load past conversations from DB on mount (Fix #2)
  useEffect(() => {
    if (!session) return;
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        setConversations(
          data.map((c) => ({
            id: c.id,
            title: c.title || "Untitled",
            timestamp: formatRelativeTime(new Date(c.updatedAt || c.createdAt)),
          }))
        );
      })
      .catch(console.error);
  }, [session]);

  // AI SDK useChat hook — handles streaming automatically
  const {
    messages,
    input,
    setInput,
    handleSubmit: chatHandleSubmit,
    isLoading,
    error: chatError,
    setMessages,
    reload,
    append,
  } = useChat({
    api: "/api/chat",
    body: { conversationId: activeConversationId, system: SYSTEM_PROMPT },
    onResponse: (response) => {
      // Capture RAG sources from response header (Fix #4 — sources captured here)
      const sourcesHeader = response.headers.get("X-RAG-Sources");
      if (sourcesHeader) {
        try { setRagSources(JSON.parse(sourcesHeader)); } catch {}
      } else {
        setRagSources([]);
      }
    },
    onFinish: () => {
      // No-op: DB persistence is handled server-side in onFinish callback
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create a new conversation if none is active
    if (!activeConversationId || messages.length === 0) {
      const newConvId = Date.now().toString();
      setActiveConversationId(newConvId);
      const newConv: Conversation = {
        id: newConvId,
        title: input.substring(0, 40),
        timestamp: new Date().toLocaleDateString(),
      };
      setConversations((prev) => [newConv, ...prev]);
    }

    chatHandleSubmit(e as React.FormEvent<HTMLFormElement>);
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setActiveConversationId(undefined);
    setRagSources([]);
  }, [setMessages, setInput]);

  // Handle suggestion button clicks from empty state
  const handleSendSuggestion = useCallback((text: string) => {
    // Create a new conversation
    const newConvId = Date.now().toString();
    setActiveConversationId(newConvId);
    const newConv: Conversation = {
      id: newConvId,
      title: text.substring(0, 40),
      timestamp: new Date().toLocaleDateString(),
    };
    setConversations((prev) => [newConv, ...prev]);

    // Use append to programmatically send the message
    append({ role: "user", content: text });
  }, [append, setConversations]);

  // Load messages when switching to an existing conversation
  const handleSelectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setRagSources([]);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs = (data.messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }, [setMessages]);

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden", background: "linear-gradient(180deg, #0a0d10 0%, #0d1117 100%)" }}>
        <header style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, background: "rgba(10,13,16,0.8)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #06b6d4, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "16px" }}>✨</span>
            </div>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#ecfeff", margin: 0, letterSpacing: "-0.01em" }}>Mehdi's Digital Twin</h1>
              <p style={{ fontSize: 13, color: "rgba(165,243,252,0.5)", margin: "2px 0 0 0" }}>AI-powered assistant · Always online</p>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {chatError && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, background: "linear-gradient(135deg,#450a0a,#7f1d1d)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", maxWidth: 400 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <AlertCircle size={20} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fecaca", fontSize: 14, margin: 0 }}>{chatError.message || "An error occurred."}</p>
                <button onClick={() => reload()} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 12px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#fecaca", fontSize: 13 }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RAG Sources banner (Fix #4) */}
        {ragSources.length > 0 && (
          <div style={{ padding: "8px 24px", background: "rgba(6,182,212,0.07)", borderBottom: "1px solid rgba(6,182,212,0.15)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#67e8f9", fontWeight: 600 }}>📎 Sources used:</span>
            {ragSources.map((s, i) => (
              <span key={i} style={{ fontSize: 12, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 6, padding: "2px 10px", color: "#a5f3fc" }}>
                {s.filename} <span style={{ opacity: 0.6 }}>{s.score}%</span>
              </span>
            ))}
            <button onClick={() => setRagSources([])} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#67e8f9", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <ChatMessages messages={messages as any} isLoading={isLoading} onSendSuggestion={handleSendSuggestion} />
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, background: "rgba(10,13,16,0.7)", backdropFilter: "blur(24px)", padding: "12px 0 max(12px, env(safe-area-inset-bottom))" }}>
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
