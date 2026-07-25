// GitHub adapter.
//
// Produces signals in the same shape the UI already renders, so switching a
// platform from sample data to live data changes nothing downstream.

const API = 'https://api.github.com'

const HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
}

interface GitHubEvent {
  id: string
  type: string
  actor: { login: string; display_login?: string; avatar_url: string }
  repo: { name: string }
  payload: any
  created_at: string
}

/** Shape the UI consumes. Mirrors Signal in lib/demo-data.ts. */
export interface LiveSignal {
  id: string
  platform: 'github'
  kind: 'commit' | 'pr' | 'run' | 'video' | 'stream' | 'presence'
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

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: HEADERS(token), cache: 'no-store' })

  if (!res.ok) {
    if (res.status === 401) throw new GitHubError('GitHub token is invalid or was revoked', 401)
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      if (remaining === '0') throw new GitHubError('GitHub rate limit reached', 403)
      throw new GitHubError('GitHub refused the request', 403)
    }
    throw new GitHubError(`GitHub API error (${res.status})`, res.status)
  }

  return res.json() as Promise<T>
}

export function whoAmI(token: string) {
  return get<GitHubUser>('/user', token)
}

export function getFollowing(token: string) {
  return get<GitHubUser[]>('/user/following?per_page=100', token)
}

/**
 * Activity from the people you follow.
 *
 * `received_events` is GitHub's own "what your network did" feed — one request
 * instead of one per followed user, which keeps this well inside the rate limit
 * even for someone following hundreds of accounts.
 */
export function getNetworkActivity(token: string, username: string) {
  return get<GitHubEvent[]>(
    `/users/${encodeURIComponent(username)}/received_events?per_page=100`,
    token
  )
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.round(days / 7)} weeks ago`
  return `${Math.round(days / 30)} months ago`
}

/** Events that say something about a person. The rest are noise. */
const INTERESTING = new Set([
  'PushEvent',
  'PullRequestEvent',
  'IssuesEvent',
  'ReleaseEvent',
  'CreateEvent',
  'ForkEvent',
  'WatchEvent',
])

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function toSignal(event: GitHubEvent): LiveSignal | null {
  if (!INTERESTING.has(event.type)) return null

  const author = event.actor.display_login || event.actor.login
  const repo = event.repo?.name ?? ''
  const base = {
    id: `gh-${event.id}`,
    platform: 'github' as const,
    author,
    avatarUrl: event.actor.avatar_url,
    when: relativeTime(event.created_at),
  }

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?.commits ?? []
      const first = commits[0]?.message?.split('\n')[0] ?? `Pushed to ${repo}`
      return {
        ...base,
        kind: 'commit',
        title: first,
        subtitle: `${commits.length || 1} commit${commits.length === 1 ? '' : 's'} · ${repo}`,
        url: `https://github.com/${repo}`,
      }
    }
    case 'PullRequestEvent': {
      const pr = event.payload?.pull_request
      const action = event.payload?.action ?? 'updated'
      // A merged PR is a genuine accomplishment, not routine noise.
      const merged = Boolean(pr?.merged)
      return {
        ...base,
        kind: 'pr',
        title: `PR #${pr?.number ?? '?'} · ${pr?.title ?? 'Pull request'}`,
        subtitle: `${merged ? 'Merged' : capitalise(action)} · ${repo}`,
        url: pr?.html_url,
        milestone: merged,
        eyebrow: merged ? `${author} shipped it` : undefined,
      }
    }
    case 'IssuesEvent':
      return {
        ...base,
        kind: 'pr',
        title: event.payload?.issue?.title ?? 'Issue',
        subtitle: `Issue ${event.payload?.action ?? ''} · ${repo}`.trim(),
        url: event.payload?.issue?.html_url,
      }
    case 'ReleaseEvent':
      return {
        ...base,
        kind: 'pr',
        title: `Released ${event.payload?.release?.tag_name ?? ''}`.trim(),
        subtitle: repo,
        url: event.payload?.release?.html_url,
        milestone: true,
        eyebrow: `${author} cut a release`,
      }
    case 'CreateEvent':
      // Only a brand-new repository is worth surfacing; branches are noise.
      if (event.payload?.ref_type !== 'repository') return null
      return {
        ...base,
        kind: 'commit',
        title: `Started ${repo}`,
        subtitle: 'New repository',
        url: `https://github.com/${repo}`,
        milestone: true,
        eyebrow: `${author} started something new`,
      }
    case 'ForkEvent':
      return {
        ...base,
        kind: 'commit',
        title: `Forked ${repo}`,
        subtitle: 'Fork',
        url: event.payload?.forkee?.html_url,
      }
    case 'WatchEvent':
      return {
        ...base,
        kind: 'commit',
        title: `Starred ${repo}`,
        subtitle: 'Star',
        url: `https://github.com/${repo}`,
      }
    default:
      return null
  }
}

/** Fetches and normalises the network feed, newest first. */
export async function fetchSignals(token: string, username: string): Promise<LiveSignal[]> {
  const events = await getNetworkActivity(token, username)
  const signals: LiveSignal[] = []
  const seen = new Set<string>()

  for (const event of events) {
    const signal = toSignal(event)
    if (!signal) continue
    // Collapse repeated pushes to the same repo by the same person.
    const key = `${signal.author}:${signal.kind}:${signal.subtitle}`
    if (seen.has(key)) continue
    seen.add(key)
    signals.push(signal)
  }

  return signals.slice(0, 40)
}
