// Demo data for Intention.
//
// Everything here is fabricated and fully self-contained — no network calls, no
// external image hosts. Avatars and thumbnails are generated as inline SVG data
// URIs so the app renders identically offline, on a plane, or in a screenshot.
// When real platform integrations land, this module is the only thing that gets
// swapped out.

export type Platform = 'youtube' | 'github' | 'twitch' | 'discord' | 'strava' | 'contacts'

export interface PlatformMeta {
  id: Platform
  name: string
  color: string
  glow: string
  connected: boolean
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  contacts: { id: 'contacts', name: 'People', color: '#10b981', glow: 'rgba(16,185,129,0.55)', connected: true },
  youtube: { id: 'youtube', name: 'YouTube', color: '#ff0000', glow: 'rgba(255,0,0,0.5)', connected: true },
  twitch: { id: 'twitch', name: 'Twitch', color: '#9146ff', glow: 'rgba(145,70,255,0.55)', connected: true },
  github: { id: 'github', name: 'GitHub', color: '#e6e6e6', glow: 'rgba(255,255,255,0.35)', connected: true },
  strava: { id: 'strava', name: 'Strava', color: '#fc4c02', glow: 'rgba(252,76,2,0.5)', connected: true },
  discord: { id: 'discord', name: 'Discord', color: '#5865f2', glow: 'rgba(88,101,242,0.5)', connected: true },
}

/* ---------------------------------------------------------------- avatars -- */

const AVATAR_GRADIENTS = [
  ['#f472b6', '#a855f7'],
  ['#38bdf8', '#6366f1'],
  ['#34d399', '#0ea5e9'],
  ['#fbbf24', '#f97316'],
  ['#a3e635', '#10b981'],
  ['#c084fc', '#6366f1'],
  ['#fb7185', '#f43f5e'],
  ['#2dd4bf', '#3b82f6'],
]

function hash(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i) | 0
  return Math.abs(h)
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Deterministic inline-SVG avatar. Same name always yields the same face. */
export function avatar(name: string): string {
  const [a, b] = AVATAR_GRADIENTS[hash(name) % AVATAR_GRADIENTS.length]
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>` +
    `</linearGradient></defs>` +
    `<rect width="100" height="100" rx="50" fill="url(#g)"/>` +
    `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="system-ui,-apple-system,sans-serif" font-size="38" font-weight="600" ` +
    `fill="rgba(255,255,255,0.95)">${initials(name)}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Deterministic gradient "thumbnail" for a piece of content. */
export function thumbnail(seed: string, tint: string): string {
  const h = hash(seed)
  const angle = h % 360
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">` +
    `<defs><linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">` +
    `<stop offset="0%" stop-color="${tint}" stop-opacity="0.85"/>` +
    `<stop offset="100%" stop-color="#0a0a0f" stop-opacity="0.95"/>` +
    `</linearGradient></defs>` +
    `<rect width="320" height="180" fill="#12121a"/>` +
    `<rect width="320" height="180" fill="url(#g)"/>` +
    `<circle cx="${40 + (h % 240)}" cy="${30 + (h % 120)}" r="${50 + (h % 60)}" ` +
    `fill="#ffffff" opacity="0.06"/>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/* ---------------------------------------------------------------- people --- */

export type Tier = 'inner_circle' | 'close_friend' | 'keep_warm'

export const TIER_LABEL: Record<Tier, string> = {
  inner_circle: 'Inner circle',
  close_friend: 'Close friend',
  keep_warm: 'Keep warm',
}

export interface Person {
  id: string
  name: string
  tier: Tier
  /** How often you want to be in touch, in days. */
  cadenceDays: number
  /** Days since you last actually talked. */
  daysSince: number
  method: string
  platforms: Platform[]
  note?: string
}

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Mom', tier: 'inner_circle', cadenceDays: 3, daysSince: 6, method: 'Call', platforms: [], note: 'Ask about the garden.' },
  { id: 'p2', name: 'Dad', tier: 'inner_circle', cadenceDays: 3, daysSince: 1, method: 'Call', platforms: [] },
  { id: 'p3', name: 'Nana', tier: 'inner_circle', cadenceDays: 21, daysSince: 25, method: 'Call', platforms: [], note: 'She prefers Sunday afternoons.' },
  { id: 'p4', name: 'Bo Kim', tier: 'close_friend', cadenceDays: 30, daysSince: 12, method: 'Text', platforms: ['strava', 'discord'] },
  { id: 'p5', name: 'Johnson Anumah', tier: 'close_friend', cadenceDays: 60, daysSince: 71, method: 'Text or call', platforms: ['github', 'discord'] },
  { id: 'p6', name: 'Maya Rodriguez', tier: 'close_friend', cadenceDays: 14, daysSince: 9, method: 'Text', platforms: ['discord'] },
  { id: 'p7', name: 'Chris Okafor', tier: 'keep_warm', cadenceDays: 45, daysSince: 44, method: 'DM', platforms: ['twitch', 'discord'] },
  { id: 'p8', name: 'Aunt Rose', tier: 'keep_warm', cadenceDays: 60, daysSince: 38, method: 'Call', platforms: [] },
  { id: 'p9', name: 'Devin Park', tier: 'close_friend', cadenceDays: 30, daysSince: 33, method: 'Text', platforms: ['github', 'strava'] },
]

export function isOverdue(p: Person) {
  return p.daysSince > p.cadenceDays
}

/** 0 = just talked, 1 = exactly at cadence, >1 = overdue. */
export function pressure(p: Person) {
  return p.daysSince / p.cadenceDays
}

export function agoLabel(days: number) {
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'Last week'
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  return `${Math.round(days / 30)} months ago`
}

/* --------------------------------------------------------------- signals --- */

export interface Signal {
  id: string
  platform: Platform
  kind: 'stream' | 'video' | 'commit' | 'pr' | 'run' | 'presence'
  title: string
  subtitle: string
  author: string
  /** Set when this signal came from someone in PEOPLE. */
  personId?: string
  live?: boolean
  viewers?: number
  when: string
  /** Marks a genuinely notable life event, not routine activity. */
  milestone?: boolean
}

export const SIGNALS: Signal[] = [
  // The emotional core: a real milestone from a real friend.
  {
    id: 's1', platform: 'strava', kind: 'run', personId: 'p4',
    title: 'Chicago Marathon — 26.2 mi', subtitle: 'First marathon · 4:12:38',
    author: 'Bo Kim', when: '3h ago', milestone: true,
  },
  {
    id: 's2', platform: 'twitch', kind: 'stream',
    title: 'Late night shader golf', subtitle: 'Creative',
    author: 'Sarah Chen', live: true, viewers: 2417, when: 'Live now',
  },
  {
    id: 's3', platform: 'twitch', kind: 'stream', personId: 'p7',
    title: 'Ranked grind w/ chat', subtitle: 'Valorant',
    author: 'Chris Okafor', live: true, viewers: 634, when: 'Live now',
  },
  {
    id: 's4', platform: 'discord', kind: 'presence',
    title: '4 friends in General', subtitle: 'Maya, Bo, Chris +1 · 38 min',
    author: 'The Backroom', when: 'Now',
  },
  {
    id: 's5', platform: 'github', kind: 'pr', personId: 'p5',
    title: 'PR #218 · Rewrite the sync engine', subtitle: 'Opened · needs review',
    author: 'Johnson Anumah', when: '5h ago',
  },
  {
    id: 's6', platform: 'youtube', kind: 'video',
    title: 'I rebuilt my studio in a weekend', subtitle: '18:04',
    author: 'Emma Wilson', when: 'Yesterday',
  },
  {
    id: 's7', platform: 'strava', kind: 'run', personId: 'p9',
    title: 'Morning run — 6.1 mi', subtitle: 'Negative split · 7:48/mi',
    author: 'Devin Park', when: 'Yesterday',
  },
  {
    id: 's8', platform: 'youtube', kind: 'video',
    title: 'Why your database is slow', subtitle: '24:11',
    author: 'Mike Torres', when: '2 days ago',
  },
  {
    id: 's9', platform: 'github', kind: 'commit', personId: 'p9',
    title: 'feat: offline-first cache layer', subtitle: '7 commits · intention',
    author: 'Devin Park', when: '2 days ago',
  },
  {
    id: 's10', platform: 'twitch', kind: 'stream',
    title: 'Sunday co-working', subtitle: 'Software & Dev · ended 2 days ago',
    author: 'Sarah Chen', when: 'You missed this',
  },
]

export function signalsFor(platform: Platform): Signal[] {
  if (platform === 'contacts') return []
  return SIGNALS.filter(s => s.platform === platform)
}

export function personById(id?: string): Person | undefined {
  return id ? PEOPLE.find(p => p.id === id) : undefined
}
