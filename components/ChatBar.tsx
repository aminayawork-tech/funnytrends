"use client";

import { useState, KeyboardEvent } from "react";

interface ChatBarProps {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatBar({ onSend, loading }: ChatBarProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 focus-within:border-[#FF6B00] rounded-2xl px-4 py-3 transition-colors shadow-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder='Try "make it darker" or "write a 60-second bit"...'
        className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-gray-400 text-sm"
        disabled={loading}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || loading}
        className="bg-[#FF6B00] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl p-2 transition-all active:scale-95 hover:bg-[#E55F00]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
