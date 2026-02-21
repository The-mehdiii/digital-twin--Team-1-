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
          <div style={{ maxWidth: "480px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
                boxShadow: "0 12px 40px rgba(6, 182, 212, 0.35), 0 0 0 1px rgba(6,182,212,0.1)",
              }}
            >
              <span style={{ fontSize: "28px", color: "#0a0d10" }}>💬</span>
            </div>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "800",
                marginBottom: "12px",
                background: "linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              Start a Conversation
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(165, 243, 252, 0.55)",
                margin: "0 auto 32px",
                maxWidth: "380px",
                lineHeight: "1.7",
              }}
            >
              Ask me anything about Mehdi's experience, skills, or projects. I'm powered by AI and ready to help!
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {["What are Mehdi's skills?", "Tell me about his projects", "Work experience?"].map((q, i) => (
                <button
                  key={i}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    borderRadius: "12px",
                    color: "#67e8f9",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6,182,212,0.15)";
                    e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(6,182,212,0.08)";
                    e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
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
