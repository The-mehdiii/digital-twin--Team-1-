"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageCircle, ArrowUpRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSendSuggestion?: (text: string) => void;
}

export function ChatMessages({ messages, isLoading, onSendSuggestion }: ChatMessagesProps) {
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
        <div className="chat-empty-state">
          <div className="chat-empty-inner">
            {/* Icon */}
            <div className="chat-empty-icon">
              <MessageCircle size={30} strokeWidth={1.8} />
            </div>

            {/* Title */}
            <h2 className="chat-empty-title">
              Start a Conversation
            </h2>
            <p className="chat-empty-desc">
              Ask me anything about Mehdi — his experience, skills, projects, or anything else. I'm powered by AI and ready to help!
            </p>

            {/* Suggestion buttons */}
            <div className="chat-suggestions">
              {[
                { text: "What are Mehdi's skills?", icon: "💡" },
                { text: "Tell me about his projects", icon: "🚀" },
                { text: "Work experience?", icon: "💼" },
              ].map((q, i) => (
                <button
                  key={i}
                  className="chat-suggestion-btn"
                  onClick={() => onSendSuggestion?.(q.text)}
                >
                  <span className="suggestion-icon">{q.icon}</span>
                  <span className="suggestion-text">{q.text}</span>
                  <ArrowUpRight size={14} className="suggestion-arrow" />
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
