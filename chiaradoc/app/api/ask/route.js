import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  const { question, context } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Sei un esperto di burocrazia italiana. Rispondi in modo chiaro e conciso a questa domanda basandoti sul documento fornito.

Documento:
${context}

Domanda: ${question}

Rispondi in 2-3 frasi massimo, in italiano semplice.`
    }]
  })

  return Response.json({ answer: response.content[0].text })
}