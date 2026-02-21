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
    <form onSubmit={handleSubmit} className="flex gap-3 px-6 py-3 max-w-[56rem] mx-auto w-full">
      <div className="flex-1 flex items-center gap-3 px-5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-2xl transition-all focus-within:border-cyan-500/50 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_24px_rgba(6,182,212,0.12)]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me about Mehdi's work, skills, or projects..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 py-3 bg-transparent border-none text-cyan-50 placeholder:text-white/30 focus:outline-none disabled:opacity-50 text-[15px]"
          suppressHydrationWarning
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          variant="cyan"
          size="icon"
          className="rounded-xl h-10 w-10 shrink-0 transition-all duration-200 shadow-lg shadow-cyan-500/20"
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
