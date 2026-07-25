import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { deleteConnection } from '@/lib/connections'

export const dynamic = 'force-dynamic'

/** Deletes the stored GitHub token. RLS scopes the delete to the caller. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const user = await getUser()
  if (!user) return NextResponse.redirect(new URL('/login?next=/integrations', origin))

  try {
    await deleteConnection('github')
    return NextResponse.redirect(new URL('/integrations?disconnected=github', origin))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not disconnect'
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(message)}`, origin)
    )
  }
}
