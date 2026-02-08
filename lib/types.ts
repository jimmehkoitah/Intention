// Platform types
export type Platform = 'youtube' | 'github' | 'twitch' | 'discord' | 'strava'

export interface PlatformConfig {
  name: string
  color: string
  icon: string
  connected: boolean
  description: string
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    color: '#ff0000',
    icon: 'Youtube',
    connected: false,
    description: 'Subscriptions, videos, live streams'
  },
  github: {
    name: 'GitHub',
    color: '#ffffff',
    icon: 'Github',
    connected: false,
    description: 'Repos, commits, pull requests'
  },
  twitch: {
    name: 'Twitch',
    color: '#9146ff',
    icon: 'Twitch',
    connected: false,
    description: 'Followed channels, live streams'
  },
  discord: {
    name: 'Discord',
    color: '#5865f2',
    icon: 'MessageCircle',
    connected: false,
    description: 'Servers, messages, activity'
  },
  strava: {
    name: 'Strava',
    color: '#fc4c02',
    icon: 'Activity',
    connected: false,
    description: 'Runs, rides, activities'
  }
}

// Relationship types
export type RelationshipTier = 'inner_circle' | 'close_friend' | 'keep_warm'

export const TIER_CONFIG: Record<RelationshipTier, { label: string; defaultFrequencyDays: number; color: string }> = {
  inner_circle: {
    label: 'Inner Circle',
    defaultFrequencyDays: 7,
    color: '#a855f7'
  },
  close_friend: {
    label: 'Close Friend',
    defaultFrequencyDays: 14,
    color: '#3b82f6'
  },
  keep_warm: {
    label: 'Keep Warm',
    defaultFrequencyDays: 30,
    color: '#6b7280'
  }
}

// Signal display types
export interface DisplaySignal {
  id: string
  platform: Platform
  type: string
  title: string
  description?: string
  url?: string
  thumbnailUrl?: string
  isLive: boolean
  contactName?: string
  contactAvatar?: string
  publishedAt: Date
}

// Mock data for demo
export interface MockPerson {
  id: string
  name: string
  tier: RelationshipTier
  avatar: string
  platforms: Platform[]
  contactMethod: string
  frequencyDays: number
  lastContactAt: Date | null
}

export const MOCK_PEOPLE: MockPerson[] = [
  {
    id: '1',
    name: 'Mom',
    tier: 'inner_circle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom',
    platforms: [],
    contactMethod: 'Call',
    frequencyDays: 3,
    lastContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    id: '2',
    name: 'Bo Kim',
    tier: 'inner_circle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bokim',
    platforms: ['discord'],
    contactMethod: 'Text',
    frequencyDays: 30,
    lastContactAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Nana',
    tier: 'inner_circle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nana',
    platforms: [],
    contactMethod: 'Text or Call',
    frequencyDays: 30,
    lastContactAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Johnson Anumah',
    tier: 'inner_circle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnson',
    platforms: ['github', 'discord'],
    contactMethod: 'Text or Call',
    frequencyDays: 60,
    lastContactAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    name: 'Dad',
    tier: 'inner_circle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dad',
    platforms: [],
    contactMethod: 'Call',
    frequencyDays: 3,
    lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
]

export interface MockSignal {
  id: string
  platform: Platform
  type: string
  title: string
  description: string
  thumbnailUrl: string
  isLive: boolean
  contactName: string
  contactAvatar: string
  publishedAt: Date
  url: string
}

export const MOCK_SIGNALS: MockSignal[] = [
  {
    id: 's1',
    platform: 'youtube',
    type: 'stream',
    title: 'Building a startup in public - Day 47',
    description: 'Live coding session building our new feature',
    thumbnailUrl: 'https://picsum.photos/seed/stream1/320/180',
    isLive: true,
    contactName: 'TechWithTim',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tim',
    publishedAt: new Date(),
    url: 'https://youtube.com/watch?v=demo1'
  },
  {
    id: 's2',
    platform: 'twitch',
    type: 'stream',
    title: 'Chill coding vibes - React & TypeScript',
    description: 'Working on the new dashboard',
    thumbnailUrl: 'https://picsum.photos/seed/stream2/320/180',
    isLive: true,
    contactName: 'ThePrimeagen',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prime',
    publishedAt: new Date(),
    url: 'https://twitch.tv/demo'
  },
  {
    id: 's3',
    platform: 'youtube',
    type: 'video',
    title: 'The TRUTH about AI coding assistants',
    description: 'My honest review after 6 months',
    thumbnailUrl: 'https://picsum.photos/seed/video1/320/180',
    isLive: false,
    contactName: 'Fireship',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fireship',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    url: 'https://youtube.com/watch?v=demo2'
  },
  {
    id: 's4',
    platform: 'github',
    type: 'commit',
    title: 'feat: Add dark mode support',
    description: 'Pushed to main branch',
    thumbnailUrl: '',
    isLive: false,
    contactName: 'Sarah Chen',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    url: 'https://github.com/demo/commit/abc123'
  },
  {
    id: 's5',
    platform: 'github',
    type: 'pr',
    title: 'PR #42: Refactor authentication flow',
    description: 'Ready for review',
    thumbnailUrl: '',
    isLive: false,
    contactName: 'Johnson Anumah',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnson',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    url: 'https://github.com/demo/pull/42'
  },
  {
    id: 's6',
    platform: 'youtube',
    type: 'video',
    title: 'Next.js 14 - Everything you need to know',
    description: 'Complete tutorial for beginners',
    thumbnailUrl: 'https://picsum.photos/seed/video2/320/180',
    isLive: false,
    contactName: 'Theo',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=theo',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    url: 'https://youtube.com/watch?v=demo3'
  },
  {
    id: 's7',
    platform: 'strava',
    type: 'run',
    title: 'Morning Run - 5.2 miles',
    description: 'Personal best pace!',
    thumbnailUrl: 'https://picsum.photos/seed/run1/320/180',
    isLive: false,
    contactName: 'Bo Kim',
    contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bokim',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    url: 'https://strava.com/activities/demo'
  }
]
