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
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 max-w-4xl mx-auto w-full">
      <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl transition-all focus-within:border-cyan-500/40 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me about Mehdi's work, skills, or projects..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-transparent border-none text-cyan-50 placeholder:text-white/25 focus:outline-none disabled:opacity-50 text-[15px]"
          suppressHydrationWarning
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          variant="cyan"
          size="icon"
          className="rounded-xl h-10 w-10 shrink-0 transition-all duration-200"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <Send className="w-4.5 h-4.5" />
          )}
        </Button>
      </div>
    </form>
  );
}
