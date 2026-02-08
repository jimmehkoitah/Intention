import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

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
