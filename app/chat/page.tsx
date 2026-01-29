"use client";

import { useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const messageIdRef = useRef(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create new conversation on first message
    if (messages.length === 0) {
      const conversationTitle = input.substring(0, 30);
      const newConvId = Date.now().toString();
      const newConversation: Conversation = {
        id: newConvId,
        title: conversationTitle,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(newConvId);
    }

    // Add user message
    const userMessage: Message = {
      id: `${messageIdRef.current++}`,
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          system: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        id: `${messageIdRef.current++}`,
        role: "assistant",
        content: data.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `${messageIdRef.current++}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setActiveConversationId(undefined);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          // TODO: Load conversation messages from database
        }}
      />
      <main>
        {/* Header */}
        <header>
          <h1>Mehdi's Digital Twin</h1>
          <p>Ask me anything about web development, projects, or collaborations</p>
        </header>

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Input */}
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "20px 24px" }}>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
