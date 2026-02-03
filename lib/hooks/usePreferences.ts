"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserPreferences {
  id: string;
  userId: string;
  theme: string;
  sidebarExpanded: boolean;
  fontSize: string;
  personality: "NEUTRAL" | "FRIENDLY" | "PROFESSIONAL" | "HUMOROUS" | "TECHNICAL";
  responseStyle: "CONCISE" | "BALANCED" | "DETAILED";
  customPrompt?: string | null;
}

const defaultPreferences: Omit<UserPreferences, "id" | "userId"> = {
  theme: "dark",
  sidebarExpanded: true,
  fontSize: "medium",
  personality: "NEUTRAL",
  responseStyle: "BALANCED",
  customPrompt: "",
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch preferences from API
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/preferences");
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, use defaults
          setPreferences(null);
          return;
        }
        throw new Error("Failed to fetch preferences");
      }
      
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<Omit<UserPreferences, "id" | "userId">>) => {
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
      
      const data = await response.json();
      setPreferences(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences: preferences || defaultPreferences,
    isLoading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
