const BACKEND_URL = 'http://localhost:8001'

export async function translateText(text, sourceLang, targetLang) {
  let response
  try {
    response = await fetch(`${BACKEND_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }),
      signal: AbortSignal.timeout(15000),
    })
  } catch (err) {
    if (err.name === 'TimeoutError') throw err
    throw new Error('Backend is not reachable. Make sure it is running.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    if (response.status === 502) throw new Error('Translation service error. Check your API key.')
    throw new Error(body.detail || `Request failed: ${response.status}`)
  }

  return response.json()
}

export async function checkHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}
