import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

const MISSING =
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
  'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).'

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error(MISSING)
  return { url, key }
}

/**
 * Server-side client for route handlers and server components.
 *
 * Reads the session from cookies, so every query carries the user's identity
 * and RLS applies. Notably this uses the anon key, not a service-role key —
 * the app never holds a credential that can bypass RLS.
 */
export function createClient() {
  const { url, key } = env()
  const store = cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options)
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  })
}

/**
 * Variant for middleware, where cookies must be written onto a response that
 * is still being constructed.
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  const { url, key } = env()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(list) {
        for (const { name, value, options } of list) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        }
      },
    },
  })
}

/** The signed-in user, or null. Never throws on an anonymous visitor. */
export async function getUser() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  } catch {
    return null
  }
}

export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
