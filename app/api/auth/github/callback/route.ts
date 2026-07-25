import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { saveConnection } from '@/lib/connections'

export const dynamic = 'force-dynamic'

const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const USER_URL = 'https://api.github.com/user'

function fail(origin: string, message: string) {
  return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(message)}`, origin))
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const denied = searchParams.get('error_description') ?? searchParams.get('error')

  if (denied) return fail(origin, denied)
  if (!code) return fail(origin, 'GitHub did not return an authorization code')

  // Reject anything whose state does not match the cookie we set.
  const expected = request.cookies.get('github_oauth_state')?.value
  if (!expected || !state || state !== expected) {
    return fail(origin, 'Sign-in state did not match. Please try connecting again.')
  }

  const user = await getUser()
  if (!user) return NextResponse.redirect(new URL('/login?next=/integrations', origin))

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return fail(origin, 'GitHub credentials are not set on the server')
  }

  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/auth/github/callback`,
      }),
    })

    if (!tokenRes.ok) {
      return fail(origin, `GitHub rejected the token request (${tokenRes.status})`)
    }

    const token = await tokenRes.json()
    // GitHub returns 200 with an `error` field rather than an HTTP error.
    if (token.error) {
      return fail(origin, token.error_description || token.error)
    }
    if (!token.access_token) {
      return fail(origin, 'GitHub did not return an access token')
    }

    const profileRes = await fetch(USER_URL, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    if (!profileRes.ok) {
      return fail(origin, `Could not read your GitHub profile (${profileRes.status})`)
    }
    const profile = await profileRes.json()

    await saveConnection({
      userId: user.id,
      platform: 'github',
      platformUserId: String(profile.id),
      platformUsername: profile.login,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresIn: token.expires_in ?? null,
      scopes: token.scope ? String(token.scope).split(',').filter(Boolean) : null,
    })

    const response = NextResponse.redirect(new URL('/integrations?connected=github', origin))
    response.cookies.delete('github_oauth_state')
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return fail(origin, `Connecting GitHub failed: ${message}`)
  }
}
