"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessageProps {
  message: Message;
}

// Code block component with copy button
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", marginBottom: "0.75em" }}>
      {/* Language label and copy button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(6, 182, 212, 0.15)",
        padding: "0.4em 0.8em",
        borderRadius: "8px 8px 0 0",
        border: "1px solid rgba(6, 182, 212, 0.2)",
        borderBottom: "none",
      }}>
        <span style={{ 
          fontSize: "0.75em", 
          color: "#67e8f9", 
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: copied ? "#22c55e" : "#94a3b8",
            fontSize: "0.75em",
            padding: "2px 6px",
            borderRadius: "4px",
            transition: "all 0.2s",
          }}
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 8px 8px",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderTop: "none",
          fontSize: "0.85em",
        }}
        showLineNumbers={children.split("\n").length > 3}
        lineNumberStyle={{ 
          color: "#4b5563",
          paddingRight: "1em",
          minWidth: "2.5em",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      <div 
        className="message-avatar"
        style={{
          background: isUser 
            ? "linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)" 
            : "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
          color: "#0a0d10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message-bubble">
        {isUser ? (
          message.content
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "0.5em", color: "#22d3ee" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "1.3em", fontWeight: "bold", marginBottom: "0.4em", color: "#22d3ee" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "1.1em", fontWeight: "bold", marginBottom: "0.3em", color: "#67e8f9" }}>{children}</h3>,
                p: ({ children }) => <p style={{ marginBottom: "0.75em", lineHeight: "1.6" }}>{children}</p>,
                ul: ({ children }) => <ul style={{ marginBottom: "0.75em", paddingLeft: "1.5em", listStyleType: "disc" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ marginBottom: "0.75em", paddingLeft: "1.5em", listStyleType: "decimal" }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: "0.25em" }}>{children}</li>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  const isInline = !className && !codeString.includes("\n");
                  
                  return isInline ? (
                    <code style={{
                      background: "rgba(6, 182, 212, 0.15)",
                      padding: "0.15em 0.4em",
                      borderRadius: "4px",
                      fontSize: "0.9em",
                      color: "#67e8f9",
                    }}>{children}</code>
                  ) : (
                    <CodeBlock language={match?.[1] || ""}>
                      {codeString}
                    </CodeBlock>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: "3px solid #06b6d4",
                    paddingLeft: "1em",
                    marginLeft: 0,
                    marginBottom: "0.75em",
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}>{children}</blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{
                    color: "#22d3ee",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}>{children}</a>
                ),
                strong: ({ children }) => <strong style={{ fontWeight: "bold", color: "#ecfeff" }}>{children}</strong>,
                em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
                table: ({ children }) => (
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "0.75em",
                    fontSize: "0.9em",
                  }}>{children}</table>
                ),
                th: ({ children }) => (
                  <th style={{
                    background: "rgba(6, 182, 212, 0.1)",
                    padding: "0.5em",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}>{children}</th>
                ),
                td: ({ children }) => (
                  <td style={{
                    padding: "0.5em",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                  }}>{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
