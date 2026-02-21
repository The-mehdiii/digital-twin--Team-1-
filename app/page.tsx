"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, ArrowRight, Sparkles, Zap, Shield, Smartphone, Database, Target, ChevronDown } from "lucide-react";
import styles from "./marquee.module.css";

const techItems = [
  { icon: "⚡", text: "Powered by Groq" },
  { icon: "🚀", text: "Next.js 15" },
  { icon: "🗄️", text: "PostgreSQL" },
  { icon: "🟢", text: "Live Now" },
  { icon: "💬", text: "Real-time Chat" },
  { icon: "🔒", text: "Secure" },
  { icon: "🤖", text: "AI-Powered" },
  { icon: "✨", text: "Smart Responses" },
];

const features = [
  { icon: MessageCircle, title: "Smart Conversations", desc: "Intelligent responses powered by advanced AI models with context-aware understanding." },
  { icon: Target, title: "Portfolio Integration", desc: "Deep knowledge about Mehdi's skills, projects, and professional experience." },
  { icon: Zap, title: "Real-time Streaming", desc: "Lightning-fast responses with live streaming for a natural chat experience." },
  { icon: Smartphone, title: "Responsive Design", desc: "Pixel-perfect experience across desktop, tablet, and mobile devices." },
  { icon: Database, title: "Conversation History", desc: "Persistent memory — pick up right where you left off anytime." },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade encryption keeping your conversations safe." },
];

const stats = [
  { value: "< 1s", label: "Response Time" },
  { value: "24/7", label: "Available" },
  { value: "100%", label: "Context Aware" },
  { value: "∞", label: "Conversations" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0d10" }}>
        <section style={{ padding: "100px 24px 80px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }} />
      </main>
    );
  }

  return (
    <main className="landing-page">
      {/* Ambient glow effects */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-logo">
              <Sparkles size={18} />
            </div>
            <span className="nav-title">Digital Twin</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#stats" className="nav-link">Stats</a>
            <Link href="/chat" className="nav-cta">
              <MessageCircle size={16} />
              Start Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge" style={{ animation: "fadeInDown 0.6s ease-out" }}>
            <span className="badge-dot" />
            <span>AI-Powered Chat Agent — Live</span>
          </div>

          <h1 className="hero-title" style={{ animation: "fadeInDown 0.7s ease-out 0.1s both" }}>
            Meet Mehdi's
            <br />
            <span className="hero-gradient">Digital Twin</span>
          </h1>

          <p className="hero-subtitle" style={{ animation: "fadeInUp 0.7s ease-out 0.2s both" }}>
            An intelligent AI chatbot that knows everything about Mehdi — skills,
            projects, experience. Have a real conversation and get instant answers.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta" style={{ animation: "fadeInUp 0.7s ease-out 0.3s both" }}>
            <Link href="/chat" className="btn-primary">
              <MessageCircle size={20} />
              Start Chatting
              <ArrowRight size={16} className="btn-arrow" />
            </Link>
            <a href="#features" className="btn-secondary">
              <ChevronDown size={18} />
              Explore Features
            </a>
          </div>

          {/* Stats Row */}
          <div className="hero-stats" id="stats" style={{ animation: "fadeInUp 0.7s ease-out 0.45s both" }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual - Chat Preview */}
        <div className="hero-visual" style={{ animation: "fadeInRight 0.8s ease-out 0.4s both" }}>
          <div className="chat-preview">
            <div className="preview-header">
              <div className="preview-dot green" />
              <div className="preview-dot yellow" />
              <div className="preview-dot red" />
              <span className="preview-title">Digital Twin Chat</span>
            </div>
            <div className="preview-body">
              <div className="preview-msg user">
                <p>What technologies does Mehdi work with?</p>
              </div>
              <div className="preview-msg assistant">
                <div className="preview-avatar">
                  <Sparkles size={12} />
                </div>
                <p>Mehdi specializes in <strong>Next.js</strong>, <strong>React</strong>, <strong>TypeScript</strong>, and <strong>Node.js</strong>. He also works with PostgreSQL, Prisma, MongoDB, and AI integrations using OpenAI & Groq APIs 🚀</p>
              </div>
              <div className="preview-msg user">
                <p>That's impressive! Tell me about his projects.</p>
              </div>
              <div className="preview-typing">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            A powerful AI assistant built with cutting-edge technology for seamless conversations.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="feature-card"
                style={{ animation: mounted ? `fadeInUp 0.5s ease-out ${0.08 * idx}s both` : "none" }}
              >
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <div className={styles.container}>
        <div className={styles.track}>
          {[...techItems, ...techItems, ...techItems].map((item, idx) => (
            <span key={idx} className={styles.item}>
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-content">
          <MessageCircle size={48} className="cta-icon" />
          <h2 className="cta-title">Ready to Chat?</h2>
          <p className="cta-subtitle">
            Start a conversation with Mehdi's Digital Twin and discover what AI-powered interaction feels like.
          </p>
          <Link href="/chat" className="btn-primary btn-lg">
            <MessageCircle size={22} />
            Open Chat Now
            <ArrowRight size={18} className="btn-arrow" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Mohammed Mehdi Musa · Built with 💜 and Next.js</p>
      </footer>

      {/* Floating Chat Button */}
      <Link href="/chat" className="floating-chat-btn" title="Start a conversation">
        <MessageCircle size={26} />
        <span className="fab-pulse" />
      </Link>
    </main>
  );
}
