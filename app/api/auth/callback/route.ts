import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Supabase Auth callback: exchanges the PKCE code for a session and sets the
 * session cookies. Used by both magic links and Google sign-in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error_description') ?? searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No+sign-in+code+was+returned', origin))
  }

  try {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin)
      )
    }
    return NextResponse.redirect(new URL(next, origin))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-in failed'
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin))
  }
}
