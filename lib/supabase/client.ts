import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 *
 * Uses the publishable (anon) key only. That key is public by design — it ships
 * in the client bundle either way — and row-level security is what actually
 * protects the data. The secret / service-role key is deliberately absent from
 * this codebase entirely: every query in the app runs as the signed-in user, so
 * the RLS policies in schema.sql are the single enforcement point.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).'
    )
  }

  return createBrowserClient(url, key)
}

/** Lets the UI decide between the live app and the sample-data demo. */
export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
