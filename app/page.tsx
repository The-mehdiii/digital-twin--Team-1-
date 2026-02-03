"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR/client mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0d10 0%, #0f1419 100%)" }}>
        <section style={{ padding: "100px 24px 80px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0d10 0%, #0f1419 100%)" }}>
      {/* Hero Section */}
      <section style={{
        padding: "100px 24px 80px",
        textAlign: "center",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{ animation: mounted ? "fadeInDown 0.8s ease-out" : "none" }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
            color: "#0a0d10",
            padding: "10px 20px",
            borderRadius: "24px",
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "24px",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 15px rgba(6, 182, 212, 0.5)",
          }}>
            ✨ AI-Powered Chat Agent
          </span>
        </div>

        <h1 style={{
          fontSize: "56px",
          fontWeight: "800",
          marginBottom: "20px",
          background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: mounted ? "fadeInDown 0.8s ease-out 0.1s both" : "none",
          lineHeight: "1.1",
          letterSpacing: "-0.03em",
        }}>
          Mehdi's Digital Twin
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#a5f3fc",
          marginBottom: "40px",
          maxWidth: "600px",
          margin: "0 auto 40px",
          lineHeight: "1.7",
          animation: mounted ? "fadeInUp 0.8s ease-out 0.2s both" : "none",
        }}>
          An intelligent chatbot powered by AI, featuring real-time conversations and seamless interactions inspired by your professional portfolio.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
          animation: mounted ? "fadeInUp 0.8s ease-out 0.3s both" : "none",
        }}>
          <Link href="/chat" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
            color: "#0a0d10",
            padding: "16px 36px",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: "700",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 8px 25px rgba(6, 182, 212, 0.5)",
            cursor: "pointer",
            border: "none",
            fontSize: "15px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 35px rgba(6, 182, 212, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(6, 182, 212, 0.5)";
          }}
          >
            Start Chat
          </Link>
          <a href="#features" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(6, 182, 212, 0.1)",
            color: "#22d3ee",
            padding: "16px 36px",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.3s ease",
            border: "2px solid rgba(6, 182, 212, 0.3)",
            cursor: "pointer",
            fontSize: "15px",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#22d3ee";
            e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.3)";
            e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
          }}
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "80px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "36px",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "48px",
          background: "linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          What's Included
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {[
            { icon: "💬", title: "Smart Conversations", desc: "Intelligent responses powered by advanced AI models" },
            { icon: "🎯", title: "Portfolio Integration", desc: "Learn about Mehdi's skills, projects, and experience" },
            { icon: "⚡", title: "Real-time Streaming", desc: "Fast, responsive interactions with minimal latency" },
            { icon: "📱", title: "Responsive Design", desc: "Works seamlessly on desktop, tablet, and mobile" },
            { icon: "💾", title: "Conversation History", desc: "Save and access your previous conversations" },
            { icon: "🔒", title: "Secure & Private", desc: "Your data is protected with enterprise-grade security" },
          ].map((feature, idx) => (
            <div key={idx} style={{
              background: "linear-gradient(135deg, rgba(15, 20, 25, 0.9) 0%, rgba(20, 30, 40, 0.7) 100%)",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid rgba(6, 182, 212, 0.15)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              cursor: "pointer",
              animation: mounted ? `fadeInUp 0.6s ease-out ${0.1 * idx}s both` : "none",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(6, 182, 212, 0.2)";
              e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.15)";
            }}
            >
              <span style={{ fontSize: "36px", display: "block", marginBottom: "16px" }}>{feature.icon}</span>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px", color: "#ecfeff" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#a5f3fc", margin: "0", lineHeight: "1.7" }}>
                {feature.desc}
              </p>
            </div>
          ))}
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
      <section style={{ padding: "80px 24px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ 
          fontSize: "36px", 
          fontWeight: "700", 
          marginBottom: "16px", 
          background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Ready to Chat?
        </h2>
        <p style={{ fontSize: "16px", color: "#a5f3fc", marginBottom: "32px" }}>
          Start a conversation with Mehdi's Digital Twin today.
        </p>
        <Link href="/chat" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
          color: "#0a0d10",
          padding: "16px 36px",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "700",
          transition: "all 0.3s ease",
          boxShadow: "0 8px 25px rgba(6, 182, 212, 0.5)",
          fontSize: "15px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 35px rgba(6, 182, 212, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(6, 182, 212, 0.5)";
        }}
        >
          Open Chat →
        </Link>
      </section>
    </main>
  );
}
