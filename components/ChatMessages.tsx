"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 8px 24px rgba(6, 182, 212, 0.5)",
              }}
            >
              <span style={{ fontSize: "32px", color: "#0a0d10" }}>✨</span>
            </div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "12px",
                background: "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome to Digital Twin
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#a5f3fc",
                margin: "0 auto",
                maxWidth: "360px",
                lineHeight: "1.6",
              }}
            >
              Ask me anything about Mehdi's experience, projects, or skills. I'm here to help!
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-bubble">
                <div className="loading">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
