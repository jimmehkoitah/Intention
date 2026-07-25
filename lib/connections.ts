import { createClient } from '@/lib/supabase/server'

/**
 * Platform connection storage.
 *
 * Tokens live in the `connections` table, which has RLS enabled and a policy
 * restricting every row to `auth.uid() = user_id`. Because the app only ever
 * uses the anon key with the caller's session, one user physically cannot read
 * another's tokens — there is no service-role key in the codebase that could
 * bypass that check.
 */

export type ConnectedPlatform = 'github' | 'twitch' | 'youtube' | 'discord' | 'strava'

export interface Connection {
  platform: ConnectedPlatform
  platform_user_id: string | null
  platform_username: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  scopes: string[] | null
}

export interface SaveConnectionInput {
  userId: string
  platform: ConnectedPlatform
  platformUserId?: string | null
  platformUsername?: string | null
  accessToken: string
  refreshToken?: string | null
  /** Seconds until expiry, as most providers report it. */
  expiresIn?: number | null
  scopes?: string[] | null
}

export async function saveConnection(input: SaveConnectionInput) {
  const supabase = createClient()

  const expiresAt = input.expiresIn
    ? new Date(Date.now() + input.expiresIn * 1000).toISOString()
    : null

  // The table has UNIQUE(user_id, platform), so reconnecting replaces the old
  // token rather than accumulating rows.
  const { error } = await supabase
    .from('connections')
    .upsert(
      {
        user_id: input.userId,
        platform: input.platform,
        platform_user_id: input.platformUserId ?? null,
        platform_username: input.platformUsername ?? null,
        access_token: input.accessToken,
        refresh_token: input.refreshToken ?? null,
        token_expires_at: expiresAt,
        scopes: input.scopes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )

  if (error) throw new Error(`Could not save the ${input.platform} connection: ${error.message}`)
}

export async function getConnection(platform: ConnectedPlatform): Promise<Connection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('connections')
    .select('platform, platform_user_id, platform_username, access_token, refresh_token, token_expires_at, scopes')
    .eq('platform', platform)
    .maybeSingle()

  if (error || !data) return null
  return data as Connection
}

export async function listConnections(): Promise<Connection[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('connections')
    .select('platform, platform_user_id, platform_username, access_token, refresh_token, token_expires_at, scopes')

  if (error || !data) return []
  return data as Connection[]
}

export async function deleteConnection(platform: ConnectedPlatform) {
  const supabase = createClient()
  const { error } = await supabase.from('connections').delete().eq('platform', platform)
  if (error) throw new Error(`Could not disconnect ${platform}: ${error.message}`)
}

/** True when a token exists and has not expired. GitHub tokens do not expire. */
export function isUsable(c: Connection | null): c is Connection {
  if (!c?.access_token) return false
  if (!c.token_expires_at) return true
  return new Date(c.token_expires_at).getTime() > Date.now()
}
