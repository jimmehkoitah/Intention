// GitHub API adapter
const GITHUB_API_BASE = 'https://api.github.com'

interface GitHubUser {
  id: number
  login: string
  name: string
  avatar_url: string
}

interface GitHubEvent {
  id: string
  type: string
  actor: {
    login: string
    avatar_url: string
  }
  repo: {
    name: string
    url: string
  }
  payload: any
  created_at: string
}

export async function getFollowing(accessToken: string) {
  const response = await fetch(`${GITHUB_API_BASE}/user/following`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return response.json() as Promise<GitHubUser[]>
}

export async function getUserEvents(accessToken: string, username: string) {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return response.json() as Promise<GitHubEvent[]>
}

export async function getFollowingActivity(accessToken: string) {
  const following = await getFollowing(accessToken)
  const events: GitHubEvent[] = []

  // Get events for each followed user (limit to avoid rate limits)
  for (const user of following.slice(0, 20)) {
    try {
      const userEvents = await getUserEvents(accessToken, user.login)
      events.push(...userEvents)
    } catch (error) {
      console.error(`Error fetching events for ${user.login}:`, error)
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return events.slice(0, 50)
}

export function transformToSignal(event: GitHubEvent) {
  let signalType: string = 'activity'
  let title = ''
  let description = ''
  let url = ''

  switch (event.type) {
    case 'PushEvent':
      signalType = 'commit'
      const commits = event.payload.commits || []
      title = commits.length > 0 ? commits[0].message : `Pushed to ${event.repo.name}`
      description = `${commits.length} commit(s) to ${event.repo.name}`
      url = `https://github.com/${event.repo.name}/commits`
      break

    case 'PullRequestEvent':
      signalType = 'pr'
      title = `PR #${event.payload.pull_request?.number}: ${event.payload.pull_request?.title || 'Pull Request'}`
      description = event.payload.action || ''
      url = event.payload.pull_request?.html_url || ''
      break

    case 'CreateEvent':
      signalType = 'activity'
      title = `Created ${event.payload.ref_type} ${event.payload.ref || ''}`
      description = `In ${event.repo.name}`
      url = `https://github.com/${event.repo.name}`
      break

    case 'WatchEvent':
      signalType = 'activity'
      title = `Starred ${event.repo.name}`
      description = ''
      url = `https://github.com/${event.repo.name}`
      break

    case 'ForkEvent':
      signalType = 'activity'
      title = `Forked ${event.repo.name}`
      description = ''
      url = event.payload.forkee?.html_url || ''
      break

    default:
      title = `${event.type.replace('Event', '')} on ${event.repo.name}`
      url = `https://github.com/${event.repo.name}`
  }

  return {
    platform: 'github' as const,
    signal_type: signalType,
    title,
    description,
    url,
    thumbnail_url: event.actor.avatar_url,
    is_live: false,
    published_at: event.created_at,
    metadata: {
      actor: event.actor.login,
      repo: event.repo.name,
      eventType: event.type,
    }
  }
}
