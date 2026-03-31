import { useState } from 'react'
import { useTranslate } from '../hooks/useTranslate'
import { LanguageToggle } from './LanguageToggle'

function BackendStatus({ backendUp }) {
  if (backendUp === null) return <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting to backend..." />
  if (!backendUp) return <span className="w-2 h-2 rounded-full bg-red-500" title="Backend not running" />
  return null
}

export function TranslatorBox({ backendUp }) {
  const [text, setText] = useState('')
  const [sourceLang, setSourceLang] = useState('EN')
  const [targetLang, setTargetLang] = useState('PT')

  const { result, isLoading, error } = useTranslate(text, sourceLang, targetLang)

  function handleToggle() {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
  }

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Header */}
      <div className="drag-region flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">AI Translator</span>
          <BackendStatus backendUp={backendUp} />
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle sourceLang={sourceLang} targetLang={targetLang} onToggle={handleToggle} />
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/20 text-xs leading-none"
            title="Minimizar"
          >─</button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-red-500/70 text-xs leading-none"
            title="Fechar"
          >✕</button>
        </div>
      </div>

      {/* Backend down banner */}
      {backendUp === false && (
        <div className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
          Backend not running. Start it with <code className="font-mono">uvicorn main:app</code>.
        </div>
      )}

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type to translate..."
        className="flex-1 bg-white/10 text-white placeholder-gray-500 rounded-lg p-2 text-sm resize-none outline-none focus:ring-1 focus:ring-white/30"
      />

      {/* Output */}
      <div className="flex-1 rounded-lg p-2 bg-white/5 text-sm min-h-[60px]">
        {isLoading && (
          <div className="flex gap-1 items-center text-gray-400">
            <span className="animate-pulse">Translating</span>
            <span className="animate-bounce">...</span>
          </div>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {!isLoading && !error && result && (
          <p className="text-white">{result}</p>
        )}
        {!isLoading && !error && !result && (
          <p className="text-gray-600 text-xs">Translation will appear here</p>
        )}
      </div>
    </div>
  )
}
