import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/integrations?error=' + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=no_code', request.url))
  }

  try {
    // Exchange code for session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(new URL('/integrations?error=auth_failed', request.url))
    }

    // Redirect to home on success
    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(new URL('/integrations?error=unknown', request.url))
  }
}
