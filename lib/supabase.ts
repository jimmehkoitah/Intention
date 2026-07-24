import { createClient, SupabaseClient } from '@supabase/supabase-js'

// These clients are created lazily on purpose.
//
// Constructing them at module load meant `next build` crashed with
// "supabaseUrl is required" whenever the environment wasn't configured, which
// broke deploys and made the app impossible to ship as a demo. Nothing on the
// demo path touches Supabase, so it must not be required in order to render.

let client: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local (see .env.example) to use Supabase-backed routes.`
    )
  }
  return value
}

/** Anon-key client. Safe for user-scoped reads/writes under RLS. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    )
  }
  return client
}

/** Service-role client. Server-side only — never import into a client component. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      process.env.SUPABASE_SERVICE_ROLE_KEY || requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    )
  }
  return adminClient
}

/** True when Supabase is configured, so routes can degrade instead of throwing. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Types for database tables
export interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface Connection {
  id: string
  user_id: string
  platform: 'youtube' | 'github' | 'twitch' | 'discord' | 'strava'
  platform_user_id: string | null
  platform_username: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  tier: 'inner_circle' | 'close_friend' | 'keep_warm'
  contact_frequency_days: number
  last_contact_at: string | null
  notes: string | null
  created_at: string
}

export interface ContactIdentity {
  id: string
  contact_id: string
  platform: string
  platform_user_id: string | null
  platform_username: string | null
  profile_url: string | null
  created_at: string
}

export interface Signal {
  id: string
  user_id: string
  contact_id: string | null
  platform: string
  signal_type: 'video' | 'stream' | 'commit' | 'pr' | 'post' | 'run' | 'activity'
  title: string
  description: string | null
  url: string | null
  thumbnail_url: string | null
  is_live: boolean
  metadata: Record<string, any> | null
  published_at: string
  created_at: string
}

export interface RelationshipNudge {
  contact: Contact
  daysSinceContact: number
  isOverdue: boolean
  urgency: 'low' | 'medium' | 'high'
  suggestedAction: string
}
