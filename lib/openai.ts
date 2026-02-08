import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function searchSignals(query: string, signals: any[]) {
  const signalSummary = signals.map(s =>
    `[${s.platform}] ${s.title} by ${s.contact_name || 'Unknown'} - ${s.signal_type}`
  ).join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for a social network aggregator app called UpKeep.
        You help users find content and understand activity from their network.
        Be concise and helpful. When searching, return relevant items and brief explanations.`
      },
      {
        role: 'user',
        content: `Given these signals from the user's network:\n${signalSummary}\n\nUser query: "${query}"\n\nReturn the most relevant items and a brief summary.`
      }
    ],
    max_tokens: 500,
  })

  return response.choices[0].message.content
}

export async function summarizeSignals(signals: any[]) {
  if (signals.length === 0) return 'No recent activity to summarize.'

  const signalSummary = signals.slice(0, 20).map(s =>
    `- [${s.platform}] ${s.title} (${s.signal_type})`
  ).join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Summarize network activity in 2-3 sentences. Be conversational and highlight interesting items.'
      },
      {
        role: 'user',
        content: `Recent activity:\n${signalSummary}`
      }
    ],
    max_tokens: 150,
  })

  return response.choices[0].message.content
}

export async function generateContactSuggestion(contact: any, daysSinceContact: number) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You help users maintain relationships. Suggest a brief, natural way to reach out.
        Keep suggestions warm and not guilt-trippy. One sentence max.`
      },
      {
        role: 'user',
        content: `Contact: ${contact.name}, Relationship: ${contact.tier}, Days since last contact: ${daysSinceContact}, Notes: ${contact.notes || 'None'}`
      }
    ],
    max_tokens: 50,
  })

  return response.choices[0].message.content
}

export default openai
