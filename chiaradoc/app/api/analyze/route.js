import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const { text } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analizza questo documento burocratico italiano. Rispondi SOLO con un oggetto JSON valido, niente altro, niente backtick. Il JSON deve avere esattamente questi campi:
{"summary":"riepilogo in 2-3 frasi semplici","keyPoints":["punto 1","punto 2","punto 3"],"rawText":"prime 200 parole del documento"}

Documento da analizzare:
${text}`
    }]
  })

  try {
    const raw = response.content[0].text
    const clean = raw.replace(/```json|```/g, '').trim()
    const json = JSON.parse(clean)
    return Response.json(json)
  } catch(e) {
    return Response.json({
      summary: response.content[0].text,
      keyPoints: [],
      rawText: text.substring(0, 500)
    })
  }
}