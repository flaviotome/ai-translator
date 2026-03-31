import { useState, useEffect, useRef } from 'react'
import { translateText } from '../api/translate'

export function useTranslate(text, sourceLang, targetLang) {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!text.trim()) {
      setResult(null)
      setError(null)
      return
    }

    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      const signal = abortRef.current.signal

      setIsLoading(true)
      setError(null)
      try {
        const data = await translateText(text, sourceLang, targetLang, signal)
        setResult(data.translated_text)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.name === 'TimeoutError' ? 'Request timed out. The backend may be slow to start.' : err.message)
        setResult(null)
      } finally {
        setIsLoading(false)
      }
    }, 2000)

    return () => {
      clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [text, sourceLang, targetLang])

  return { result, isLoading, error }
}
