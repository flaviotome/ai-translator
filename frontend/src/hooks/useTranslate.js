import { useState, useEffect, useRef } from 'react'
import { translateText } from '../api/translate'

export function useTranslate(text, sourceLang, targetLang) {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!text.trim()) {
      setResult(null)
      setError(null)
      return
    }

    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await translateText(text, sourceLang, targetLang)
        setResult(data.translated_text)
      } catch (err) {
        setError(err.name === 'TimeoutError' ? 'Request timed out. The backend may be slow to start.' : err.message)
        setResult(null)
      } finally {
        setIsLoading(false)
      }
    }, 2000)

    return () => clearTimeout(timerRef.current)
  }, [text, sourceLang, targetLang])

  return { result, isLoading, error }
}
