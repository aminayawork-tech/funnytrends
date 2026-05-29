export default function Header({ onReset }: { onReset?: () => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onReset}
        disabled={!onReset}
        className="group text-left"
      >
        <div className="font-bold text-[#FF6B00] text-lg leading-tight group-hover:opacity-80 transition-opacity">
          FunnyTrends
        </div>
        <div className="text-[10px] text-gray-400 leading-tight">
          Comedy at the speed of news
        </div>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Live</span>
      </div>
    </header>
  );
}
