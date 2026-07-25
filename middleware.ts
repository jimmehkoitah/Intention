import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

/**
 * Refreshes the Supabase session on every request.
 *
 * Without this, access tokens expire mid-session and Server Components start
 * seeing a signed-out user even though the browser still thinks it is signed
 * in. Calling getUser() here revalidates the token and writes the rotated
 * cookies onto the outgoing response.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  // With no Supabase configuration the app still runs, on sample data.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  try {
    const supabase = createMiddlewareClient(request, response)
    await supabase.auth.getUser()
  } catch {
    // Never let an auth hiccup turn into a blank page.
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — those never need a
     * session and would only add latency.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
