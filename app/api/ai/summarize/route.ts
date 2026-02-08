import { NextRequest, NextResponse } from 'next/server'
import { summarizeSignals } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signals } = body

    if (!signals || !Array.isArray(signals)) {
      return NextResponse.json({ error: 'Signals array is required' }, { status: 400 })
    }

    // Use OpenAI to summarize signals
    const summary = await summarizeSignals(signals)

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('AI summarize error:', err)

    return NextResponse.json({
      summary: 'Unable to generate summary at the moment.',
    }, { status: 500 })
  }
}
