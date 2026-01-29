"use client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      <div className="message-bubble">
        {message.content}
      </div>
    </div>
  );
}
