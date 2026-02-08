import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('YouTube OAuth error:', error)
    return NextResponse.redirect(new URL('/integrations?error=' + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=no_code', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/integrations?error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/integrations?error=userinfo_failed', request.url))
    }

    const userInfo = await userInfoResponse.json()

    // For demo purposes, store in a cookie (in production, save to database)
    const response = NextResponse.redirect(new URL('/integrations?success=youtube', request.url))

    // Set secure cookie with connection info
    response.cookies.set('youtube_connection', JSON.stringify({
      platform: 'youtube',
      platform_user_id: userInfo.id,
      platform_username: userInfo.name,
      connected_at: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Store tokens securely (in production, encrypt and save to database)
    response.cookies.set('youtube_tokens', JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (err) {
    console.error('YouTube callback error:', err)
    return NextResponse.redirect(new URL('/integrations?error=unknown', request.url))
  }
}
