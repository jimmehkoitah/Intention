import { NextRequest, NextResponse } from 'next/server'
import { searchSignals } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, signals } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Use OpenAI to search through signals
    const result = await searchSignals(query, signals || [])

    return NextResponse.json({ result })
  } catch (err) {
    console.error('AI search error:', err)

    // Return a helpful fallback response
    return NextResponse.json({
      result: 'Unable to perform AI search at the moment. Please try again later.',
    }, { status: 500 })
  }
}
