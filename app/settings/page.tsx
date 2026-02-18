"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { ArrowLeft, Sparkles, Check } from "lucide-react";

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "20px 24px",
  marginBottom: 20,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#67e8f9",
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(6,182,212,0.25)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 14,
  padding: "10px 14px",
  width: "100%",
  cursor: "pointer",
  outline: "none",
};

export default function SettingsPage() {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const [local, setLocal] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setLocal(preferences);
  }, [preferences]);

  if (isLoading || !local) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0a0d10 0%,#0f1419 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#67e8f9", fontSize: 14 }}>Loading preferences…</div>
      </div>
    );
  }

  const personalities = ["NEUTRAL", "FRIENDLY", "PROFESSIONAL", "HUMOROUS", "TECHNICAL"];
  const styles = ["CONCISE", "BALANCED", "DETAILED"];

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updatePreferences({
        theme: local.theme,
        sidebarExpanded: local.sidebarExpanded,
        fontSize: local.fontSize,
        personality: local.personality,
        responseStyle: local.responseStyle,
        customPrompt: local.customPrompt,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0a0d10 0%,#0f1419 100%)", padding: "24px", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Back */}
        <button
          onClick={() => router.push("/chat")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "#67e8f9", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Chat
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={22} color="#0a0d10" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Settings</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0 0" }}>Customise your Digital Twin experience</p>
          </div>
        </div>

        {/* Personality */}
        <div style={card}>
          <label style={label}>AI Personality</label>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>Changes the tone Groq uses when responding to you.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {personalities.map((p) => (
              <button
                key={p}
                onClick={() => setLocal({ ...local, personality: p as any })}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: local.personality === p ? "1px solid #06b6d4" : "1px solid rgba(255,255,255,0.1)",
                  background: local.personality === p ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
                  color: local.personality === p ? "#22d3ee" : "#94a3b8",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Response Style */}
        <div style={card}>
          <label style={label}>Response Style</label>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>Controls how long and detailed answers are.</p>
          <div style={{ display: "flex", gap: 10 }}>
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setLocal({ ...local, responseStyle: s as any })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: local.responseStyle === s ? "1px solid #06b6d4" : "1px solid rgba(255,255,255,0.1)",
                  background: local.responseStyle === s ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
                  color: local.responseStyle === s ? "#22d3ee" : "#94a3b8",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Custom System Prompt */}
        <div style={card}>
          <label style={label}>Custom System Prompt</label>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>Optional extra instructions prepended to the AI system prompt.</p>
          <textarea
            value={local.customPrompt || ""}
            onChange={(e) => setLocal({ ...local, customPrompt: e.target.value })}
            rows={6}
            style={{ ...selectStyle, fontFamily: "monospace", resize: "vertical" }}
            placeholder="e.g. Always respond in bullet points and give code examples."
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px",
            background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#06b6d4,#22d3ee)",
            border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
            borderRadius: 10,
            color: saved ? "#4ade80" : "#0a0d10",
            fontSize: 14, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.3s",
          }}
        >
          {saved ? <><Check size={16} /> Saved!</> : saving ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
