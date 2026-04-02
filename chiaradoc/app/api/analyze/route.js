
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')
  
  let text = ''
  
  try {
    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64
              }
            },
            {
              type: 'text',
              text: 'Analizza questo documento burocratico italiano. Rispondi SOLO con un oggetto JSON valido, niente altro, niente backtick: {"summary":"riepilogo in 2-3 frasi semplici","keyPoints":["punto 1","punto 2","punto 3"],"rawText":"prime 200 parole del documento"}'
            }
          ]
        }]
      })
      
      const raw = response.content[0].text
      const clean = raw.replace(/```json|```/g, '').trim()
      return Response.json(JSON.parse(clean))
    } else {
      text = await file.text()
      
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analizza questo documento burocratico italiano. Rispondi SOLO con un oggetto JSON valido, niente altro, niente backtick: {"summary":"riepilogo in 2-3 frasi semplici","keyPoints":["punto 1","punto 2","punto 3"],"rawText":"prime 200 parole del documento"}

Documento:
${text.substring(0, 4000)}`
        }]
      })
      
      const raw = response.content[0].text
      const clean = raw.replace(/```json|```/g, '').trim()
      return Response.json(JSON.parse(clean))
    }
  } catch(e) {
    console.error(e)
    return Response.json({ error: e.message }, { status: 500 })
  }
}