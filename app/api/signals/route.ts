import { NextResponse } from 'next/server'
import { getUser, isConfigured } from '@/lib/supabase/server'
import { getConnection, isUsable } from '@/lib/connections'
import * as github from '@/lib/platforms/github'

export const dynamic = 'force-dynamic'

/**
 * Live signals from the caller's connected platforms.
 *
 * Always returns 200 with a `status` the UI can act on, rather than an error
 * code — "you are signed out" and "you have not connected anything yet" are
 * normal states of the product, not failures.
 */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ status: 'unconfigured', signals: [], platforms: [] })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ status: 'signed_out', signals: [], platforms: [] })
  }

  const connection = await getConnection('github')
  if (!isUsable(connection)) {
    return NextResponse.json({ status: 'no_connections', signals: [], platforms: [] })
  }

  const username = connection.platform_username
  if (!username) {
    return NextResponse.json({
      status: 'error',
      error: 'The GitHub connection is missing a username. Reconnect GitHub.',
      signals: [],
      platforms: [],
    })
  }

  try {
    const signals = await github.fetchSignals(connection.access_token!, username)

    return NextResponse.json({
      status: 'ok',
      platforms: ['github'],
      account: username,
      signals,
    })
  } catch (err) {
    // Surface why it failed. A silent empty feed is indistinguishable from
    // "your friends did nothing", which would be the wrong thing to conclude.
    const status = err instanceof github.GitHubError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Could not reach GitHub'
    return NextResponse.json({
      status: status === 401 ? 'reauth_required' : 'error',
      error: message,
      signals: [],
      platforms: [],
    })
  }
}
