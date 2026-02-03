"use client";

import { FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount and after each message
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 border-t border-cyan-900/30 bg-gray-900/50">
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask me about Mehdi's work, skills, or projects..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="flex-1 px-4 py-3 bg-gray-800/50 border border-cyan-800/30 rounded-xl text-cyan-50 placeholder:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
        suppressHydrationWarning
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        variant="cyan"
        size="lg"
        className="px-6"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
          </span>
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
  );
}
