'use client'
import { useState } from 'react'

interface Result {
  summary: string
  keyPoints: string[]
  rawText: string
}

interface Answer {
  q: string
  a: string
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])

  function uploadFile(f: File) {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', f)
    fetch('/api/analyze', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => { alert('Errore durante l\'analisi'); setLoading(false) })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) uploadFile(f)
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) uploadFile(f)
  }

  async function askQuestion() {
    if (!question.trim()) return
    const q = question
    setQuestion('')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: result?.rawText })
      })
      const data = await res.json()
      setAnswers(prev => [...prev, { q, a: data.answer }])
    } catch (e) {
      alert('Errore nella risposta')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">ChiaroDoc</h1>
          <p className="text-gray-500 text-lg">Carica un documento burocratico e capisci tutto in secondi</p>
        </div>

        {!result && !loading && (
          <label
            className="block border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors bg-white"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-600 font-medium">Clicca o trascina un documento</p>
            <p className="text-gray-400 text-sm mt-1">TXT, MD, PDF</p>
            <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFile} />
          </label>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-2xl mb-3">⏳</div>
            <p className="text-gray