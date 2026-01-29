"use client";

import { useChat } from "ai/react";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    system: SYSTEM_PROMPT,
    initialMessages: [],
  });

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">Mehdi's Digital Twin</h1>
        <p className="text-sm text-gray-600">
          Ask me anything about web development, projects, or collaborations
        </p>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
