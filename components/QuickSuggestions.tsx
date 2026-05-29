"use client";

import { useState, useRef, useEffect } from "react";

const REFINEMENTS = [
  { label: "Make it darker", message: "Make it much darker and edgier" },
  { label: "Clean version", message: "Give me a cleaner, family-friendly version" },
  { label: "60-second bit", message: "Turn the best jokes into a tight 60-second stand-up bit" },
  { label: "Twitter thread", message: "Write this as a funny Twitter/X thread" },
  { label: "More roast", message: "Give me more savage roast-style jokes" },
  { label: "New angles", message: "Come up with completely different angles on this topic" },
  { label: "Bill Burr style", message: "Rewrite in the style of Bill Burr — aggressive, ranty, blue-collar outrage, zero filter, calls out everyone including himself" },
  { label: "Kat Williams style", message: "Rewrite in the style of Kat Williams — rapid-fire, street philosophy, conspiratorial energy, theatrical delivery, builds to explosive punchlines" },
  { label: "Dave Chappelle style", message: "Rewrite in the style of Dave Chappelle — sharp social commentary, storytelling, unexpected twists" },
  { label: "John Mulaney style", message: "Rewrite in the style of John Mulaney — clean, story-driven, self-deprecating, precise word choice" },
];

interface QuickSuggestionsProps {
  onSelect: (message: string) => void;
}

export default function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-20 slide-up">
          {REFINEMENTS.map((r) => (
            <button
              key={r.label}
              onClick={() => {
                onSelect(r.message);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FFF3E8] hover:text-[#FF6B00] border-b border-gray-50 last:border-0 transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
      >
        <span>Refine material...</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
