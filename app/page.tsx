"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      {/* Hero Section */}
      <section style={{
        padding: "80px 24px",
        textAlign: "center",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          animation: "fadeInDown 0.8s ease-out",
        }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "24px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
            letterSpacing: "0.5px",
          }}>
            ✨ AI-Powered Chat Agent
          </span>
        </div>

        <h1 style={{
          fontSize: "48px",
          fontWeight: "800",
          marginBottom: "16px",
          background: "linear-gradient(135deg, #111827 0%, #2563eb 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "fadeInDown 0.8s ease-out 0.1s both",
          lineHeight: "1.2",
        }}>
          Mehdi's Digital Twin
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          marginBottom: "32px",
          maxWidth: "600px",
          margin: "0 auto 32px",
          lineHeight: "1.6",
          animation: "fadeInUp 0.8s ease-out 0.2s both",
        }}>
          An intelligent chatbot powered by AI, featuring real-time conversations and seamless interactions inspired by your professional portfolio.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
          animation: "fadeInUp 0.8s ease-out 0.3s both",
        }}>
          <Link href="/chat" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(37, 99, 235, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.3)";
          }}
          >
            🚀 Start Chat
          </Link>
          <a href="#features" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            color: "#2563eb",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.3s ease",
            border: "2px solid #e5e7eb",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.background = "#f0f9ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.background = "white";
          }}
          >
            📖 Learn More
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
          color: "#111827",
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
              background: "white",
              padding: "32px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              cursor: "pointer",
              animation: `fadeInUp 0.6s ease-out ${0.1 * idx}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}>{feature.icon}</span>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#111827" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0", lineHeight: "1.6" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        padding: "60px 24px",
        marginTop: "40px",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px",
          textAlign: "center",
        }}>
          {[
            { label: "Smart AI", value: "Powered by Groq" },
            { label: "Tech Stack", value: "Next.js 15" },
            { label: "Database", value: "Postgres" },
            { label: "Status", value: "🚀 Live" },
          ].map((stat, idx) => (
            <div key={idx}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.8)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "white", margin: "0" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: "60px 24px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "16px", color: "#111827" }}>
          Ready to Chat?
        </h2>
        <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "32px" }}>
          Start a conversation with Mehdi's Digital Twin today.
        </p>
        <Link href="/chat" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "white",
          padding: "14px 32px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(37, 99, 235, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.3)";
        }}
        >
          Open Chat →
        </Link>
      </section>
    </main>
  );
}
