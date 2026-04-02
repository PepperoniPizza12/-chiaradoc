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
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])

  async function analyzeDoc(text: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      alert('Errore durante l\'analisi')
    }
    setLoading(false)
  }

function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
  const f = e.target.files?.[0]
  if (!f) return
  setFile(f)
  setLoading(true)
  const formData = new FormData()
  formData.append('file', f)
  fetch('/api/analyze', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => { setResult(data); setLoading(false) })
    .catch(() => { alert('Errore durante l\'analisi'); setLoading(false) })
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

        {!result && (
          <label 
  className="block border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors bg-white"
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    const formData = new FormData()
    formData.append('file', f)
    fetch('/api/analyze', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => { alert('Errore durante l\'analisi'); setLoading(false) })
  }}
>
  <div className="text-4xl mb-4">📄</div>
  <p className="text-gray-600 font-medium">Clicca per caricare un documento</p>
  <p className="text-gray-400 text-sm mt-1">TXT, MD, PDF</p>
  <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFile} />
</label>

        {loading && (
          <div className="text-center py-12">
            <div className="text-2xl mb-3">⏳</div>
            <p className="text-gray-500">Analisi in corso...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Riepilogo</h2>
              <p className="text-gray-800 leading-relaxed">{result.summary}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Punti chiave</h2>
              <ul className="space-y-3">
                {result.keyPoints?.map((p, i) => (
                  <li key={i} className="flex gap-3 text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Fai una domanda</h2>
              {answers.map((item, i) => (
                <div key={i} className="mb-4 pb-4 border-b border-gray-100">
                  <p className="font-medium text-gray-800 mb-1">{item.q}</p>
                  <p className="text-gray-600 text-sm">{item.a}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askQuestion()}
                  placeholder="Es. Qual è la scadenza?"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
                <button onClick={askQuestion} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">
                  Chiedi
                </button>
              </div>
            </div>

            <button onClick={() => { setResult(null); setFile(null); setAnswers([]) }} className="text-sm text-gray-400 hover:text-gray-600 mx-auto block">
              Carica nuovo documento
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
