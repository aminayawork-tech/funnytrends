export default function Header({ onReset }: { onReset?: () => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onReset}
        className="flex items-center gap-2 group"
        disabled={!onReset}
      >
        <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">FT</span>
        </div>
        <div>
          <div className="font-bold text-[#1A1A1A] leading-tight text-sm group-hover:text-[#FF6B00] transition-colors">
            FunnyTrends
          </div>
          <div className="text-[10px] text-gray-400 leading-tight">
            Comedy at the speed of news
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Live</span>
      </div>
    </header>
  );
}
