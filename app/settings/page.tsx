"use client";

import React, { useState } from "react";
import { usePreferences } from "@/lib/hooks/usePreferences";

export default function SettingsPage() {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const [local, setLocal] = useState(preferences);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setLocal(preferences);
  }, [preferences]);

  if (isLoading || !local) return <div>Loading...</div>;

  const personalities = ["NEUTRAL", "FRIENDLY", "PROFESSIONAL", "HUMOROUS", "TECHNICAL"];
  const styles = ["CONCISE", "BALANCED", "DETAILED"];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        theme: local.theme,
        sidebarExpanded: local.sidebarExpanded,
        fontSize: local.fontSize,
        personality: local.personality,
        responseStyle: local.responseStyle,
        customPrompt: local.customPrompt,
      } as any);
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Settings</h1>

      <section style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Personality</label>
        <select
          value={local.personality}
          onChange={(e) => setLocal({ ...local, personality: e.target.value as any })}
        >
          {personalities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </section>

      <section style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Response Style</label>
        <select
          value={local.responseStyle}
          onChange={(e) => setLocal({ ...local, responseStyle: e.target.value as any })}
        >
          {styles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Custom System Prompt (optional)</label>
        <textarea
          value={local.customPrompt || ""}
          onChange={(e) => setLocal({ ...local, customPrompt: e.target.value })}
          rows={6}
          style={{ width: "100%", fontFamily: "monospace", padding: 8 }}
          placeholder="Optional: customize how the assistant should behave for you"
        />
      </section>

      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: "8px 12px" }}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
