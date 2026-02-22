"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, Star, ExternalLink, Linkedin } from "lucide-react";
import { usePreferences } from "@/lib/hooks/usePreferences";

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
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { updatePreferences } = usePreferences();
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Note: We don't auto-sync from saved preferences to avoid unexpected collapse
  // Users can manually collapse/expand and it will be saved

  const handleToggleSidebar = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    // Persist preference if user is logged in
    if (session?.user) {
      updatePreferences({ sidebarExpanded: newState }).catch(console.error);
    }
  }, [isExpanded, session?.user, updatePreferences]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
    <aside
      className={`flex flex-col h-full bg-[#061014] text-slate-100 overflow-hidden
        md:relative md:translate-x-0 md:transition-[width] md:duration-200
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isExpanded ? 'w-72' : 'w-72 md:w-20'}
      `}
      aria-label="Main sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-md"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 12,
            }}
          >
            <Sparkles size={20} color="#0a0d10" />
          </div>
          {isExpanded && (
            <div className="leading-tight">
              <h2 className="text-sm font-semibold m-0">Mehdi</h2>
              <p className="text-xs text-sky-300 m-0">Digital Twin</p>
            </div>
          )}
        </div>

        <button
          onClick={handleToggleSidebar}
          title="Toggle sidebar"
          className="p-2 rounded-md hover:bg-white/5"
          suppressHydrationWarning
          aria-pressed={!isExpanded}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-slate-800/30 to-transparent p-2 rounded-lg hover:bg-slate-800/40"
          suppressHydrationWarning
        >
          <Plus size={18} />
          {isExpanded && <span className="font-medium">New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 mt-3">
        {isExpanded && <h3 className="px-2 pb-1 text-xs text-slate-500 uppercase tracking-wider">Recent Conversations</h3>}
        <div className="flex flex-col gap-0.5 mt-1">
          {conversations.length === 0 ? (
            isExpanded && (
              <p className="px-3 text-sm text-slate-500">No conversations yet.<br/>Start a new chat above!</p>
            )
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`conversation-item ${activeConversationId === conv.id ? "active" : ""}`}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
                suppressHydrationWarning
              >
                <MessageSquare size={15} style={{ flexShrink: 0, opacity: 0.5 }} />
                {isExpanded && (
                  <div className="conv-info">
                    <span className="conv-title">{conv.title}</span>
                    <span className="conv-time">{conv.timestamp}</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer p-4 border-t border-slate-800/60">
        {mounted && session?.user && (
          <div className="user-section mb-3 flex items-center gap-3 p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, rgba(34, 211, 238, 0.04) 100%)',
              border: '1px solid rgba(6,182,212,0.08)'
            }}
          >
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '2px solid rgba(6,182,212,0.9)',
                  boxShadow: '0 6px 18px rgba(2,6,23,0.6)'
                }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: '#0a0d10',
                boxShadow: '0 6px 18px rgba(2,6,23,0.6)',
              }}>
                {session.user.name?.[0] || "U"}
              </div>
            )}
            {isExpanded && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ecfeff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {session.user.name || "User"}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#67e8f9',
                  margin: '2px 0 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5"
            title="Settings"
            suppressHydrationWarning
            onClick={() => router.push('/settings')}
          >
            <Settings size={18} />
            {isExpanded && <span>Settings</span>}
          </button>

          <button
            className="flex items-center gap-3 p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
            title="Starchat"
            onClick={onNewChat}
            suppressHydrationWarning
          >
            <Star size={18} />
            {isExpanded && <span>Starchat</span>}
          </button>

          <button
            className="flex items-center gap-3 p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
            title="Learn more"
            onClick={() => window.open(process.env.NEXT_PUBLIC_APP_URL || '/', '_blank')}
            suppressHydrationWarning
          >
            <ExternalLink size={18} />
            {isExpanded && <span>Learn More</span>}
          </button>

          <a
            href="https://www.linkedin.com/in/mohammed-mehdi-musa-71704422a/"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            className="flex items-center gap-3 p-2 rounded-md text-[#0a66c2] hover:text-blue-300 hover:bg-white/5 transition-colors"
          >
            <Linkedin size={18} />
            {isExpanded && <span>LinkedIn</span>}
          </a>

          {mounted && session && (
            <button
              className="flex items-center gap-3 p-2 rounded-md text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-colors"
              title="Sign Out"
              onClick={() => signOut({ callbackUrl: '/' })}
              suppressHydrationWarning
            >
              <LogOut size={18} />
              {isExpanded && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </div>
        </aside>
    </>
  );
}
