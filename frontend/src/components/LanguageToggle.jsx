export function LanguageToggle({ sourceLang, targetLang, onToggle }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span className="font-medium text-white">{sourceLang}</span>
      <button
        onClick={onToggle}
        className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
        title="Swap languages"
      >
        ⇄
      </button>
      <span className="font-medium text-white">{targetLang}</span>
    </div>
  )
}
