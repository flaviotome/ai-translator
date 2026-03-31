import { useState, useEffect } from 'react'
import { TranslatorBox } from './components/TranslatorBox'
import { checkHealth } from './api/translate'

export default function App() {
  const [backendUp, setBackendUp] = useState(null)

  useEffect(() => {
    checkHealth().then(setBackendUp)
  }, [])

  return (
    <div className="w-full h-screen bg-black/30 rounded-xl overflow-hidden border border-white/10">
      <TranslatorBox backendUp={backendUp} />
    </div>
  )
}
