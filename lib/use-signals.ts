'use client'

import { useEffect, useState } from 'react'
import type { Signal } from '@/lib/demo-data'

export type FeedStatus =
  | 'loading'
  | 'ok'
  | 'signed_out'
  | 'no_connections'
  | 'unconfigured'
  | 'reauth_required'
  | 'error'

interface Feed {
  status: FeedStatus
  signals: Signal[]
  account?: string
  error?: string
}

/** Raw shape returned by /api/signals. */
interface ApiSignal {
  id: string
  platform: string
  kind: string
  title: string
  subtitle: string
  author: string
  avatarUrl?: string
  url?: string
  when: string
  live?: boolean
  milestone?: boolean
  eyebrow?: string
}

/**
 * Fetches live signals, if the user is signed in and has connected anything.
 *
 * Any non-ok status is returned rather than thrown, so the UI can fall back to
 * sample data and still explain why the real feed is missing.
 */
export function useSignals(): Feed {
  const [feed, setFeed] = useState<Feed>({ status: 'loading', signals: [] })

  useEffect(() => {
    let cancelled = false

    fetch('/api/signals')
      .then(r => r.json())
      .then((data: { status: FeedStatus; signals?: ApiSignal[]; account?: string; error?: string }) => {
        if (cancelled) return
        setFeed({
          status: data.status,
          account: data.account,
          error: data.error,
          signals: (data.signals ?? []).map(s => ({
            id: s.id,
            platform: s.platform as Signal['platform'],
            kind: s.kind as Signal['kind'],
            title: s.title,
            subtitle: s.subtitle,
            author: s.author,
            avatarUrl: s.avatarUrl,
            url: s.url,
            when: s.when,
            live: s.live,
            milestone: s.milestone,
            eyebrow: s.eyebrow,
          })),
        })
      })
      .catch(err => {
        if (!cancelled) {
          setFeed({ status: 'error', signals: [], error: err?.message ?? 'Network error' })
        }
      })

    return () => { cancelled = true }
  }, [])

  return feed
}
