import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const AUTHORIZE = 'https://github.com/login/oauth/authorize'

/**
 * Starts the GitHub OAuth flow.
 *
 * `read:user` and `user:follow` are the minimum needed to read who you follow
 * and their public activity. No repo scope is requested — this app never needs
 * access to code.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin

  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?next=/integrations', origin))
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/integrations?error=GITHUB_CLIENT_ID+is+not+set+on+the+server', origin)
    )
  }

  // CSRF protection: a random state echoed back by GitHub and compared in the
  // callback. Stored in an httpOnly cookie so the page itself cannot forge it.
  const state = randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/github/callback`,
    scope: 'read:user user:follow',
    state,
    allow_signup: 'false',
  })

  const response = NextResponse.redirect(`${AUTHORIZE}?${params}`)
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return response
}
