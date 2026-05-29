"use client";

const SUGGESTIONS = [
  { label: "🌑 Darker", message: "Make it much darker and edgier" },
  { label: "✨ Cleaner", message: "Give me a cleaner, family-friendly version" },
  { label: "🎙️ 60-sec bit", message: "Turn the best jokes into a 60-second stand-up bit" },
  { label: "🐦 Tweet thread", message: "Write this as a funny Twitter/X thread" },
  { label: "😤 More roast", message: "Give me more savage roast-style jokes" },
  { label: "🔄 New angles", message: "Come up with completely different angles" },
];

interface QuickSuggestionsProps {
  onSelect: (message: string) => void;
}

export default function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
      <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.message)}
            className="flex-shrink-0 text-xs bg-white border border-gray-200 rounded-full px-3 py-2 text-gray-600 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FFF3E8] transition-all active:scale-95 whitespace-nowrap"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
