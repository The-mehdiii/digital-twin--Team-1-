"use client";

import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo">MM</div>
          {isExpanded && (
            <div className="logo-text">
              <h2>Mehdi</h2>
              <p>Digital Twin</p>
            </div>
          )}
        </div>
        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Toggle sidebar"
        >
          {isExpanded ? "←" : "→"}
        </button>
      </div>

      {/* New Chat Button */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <span className="icon">+</span>
        {isExpanded && <span>New Chat</span>}
      </button>

      {/* Conversations */}
      <div className="conversations-section">
        {isExpanded && (
          <h3 className="section-title">Recent Conversations</h3>
        )}
        <div className="conversations-list">
          {conversations.length === 0 ? (
            isExpanded && (
              <p className="empty-state">No conversations yet</p>
            )
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`conversation-item ${
                  activeConversationId === conv.id ? "active" : ""
                }`}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
              >
                <span className="conv-icon">💬</span>
                {isExpanded && (
                  <div className="conv-info">
                    <p className="conv-title">{conv.title}</p>
                    <p className="conv-time">{conv.timestamp}</p>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="footer-btn" title="Settings">
          ⚙️
          {isExpanded && <span>Settings</span>}
        </button>
        <button className="footer-btn" title="Help">
          ❓
          {isExpanded && <span>Help</span>}
        </button>
      </div>
    </aside>
  );
}
