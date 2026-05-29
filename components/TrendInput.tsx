"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface TrendInputProps {
  onSubmit: (topic: string) => void;
  loading: boolean;
}

export default function TrendInput({ onSubmit, loading }: TrendInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 focus-within:border-[#FF6B00] rounded-2xl px-4 py-3 transition-colors shadow-sm">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a trending topic..."
        className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder-gray-400 text-base"
        disabled={loading}
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || loading}
        className="bg-[#FF6B00] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 hover:bg-[#E55F00]"
      >
        {loading ? "..." : "Go"}
      </button>
    </div>
  );
}
