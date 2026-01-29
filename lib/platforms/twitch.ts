// Twitch API adapter
const TWITCH_API_BASE = 'https://api.twitch.tv/helix'

interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
}

interface TwitchStream {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_name: string
  title: string
  viewer_count: number
  started_at: string
  thumbnail_url: string
  is_mature: boolean
}

interface TwitchFollow {
  from_id: string
  from_login: string
  to_id: string
  to_login: string
  to_name: string
  followed_at: string
}

export async function getFollowedChannels(accessToken: string, userId: string, clientId: string) {
  const response = await fetch(
    `${TWITCH_API_BASE}/channels/followed?user_id=${userId}&first=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Twitch API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data as TwitchFollow[]
}

export async function getLiveStreams(accessToken: string, userIds: string[], clientId: string) {
  if (userIds.length === 0) return []

  // Twitch allows up to 100 user_ids per request
  const batches = []
  for (let i = 0; i < userIds.length; i += 100) {
    batches.push(userIds.slice(i, i + 100))
  }

  const streams: TwitchStream[] = []

  for (const batch of batches) {
    const params = batch.map(id => `user_id=${id}`).join('&')
    const response = await fetch(
      `${TWITCH_API_BASE}/streams?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': clientId,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      streams.push(...data.data)
    }
  }

  return streams
}

export async function getFollowedStreams(accessToken: string, userId: string, clientId: string) {
  const response = await fetch(
    `${TWITCH_API_BASE}/streams/followed?user_id=${userId}&first=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Twitch API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data as TwitchStream[]
}

export function transformToSignal(stream: TwitchStream) {
  // Twitch thumbnail URLs have {width} and {height} placeholders
  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '320')
    .replace('{height}', '180')

  return {
    platform: 'twitch' as const,
    signal_type: 'stream',
    title: stream.title,
    description: `Playing ${stream.game_name} - ${stream.viewer_count.toLocaleString()} viewers`,
    url: `https://twitch.tv/${stream.user_login}`,
    thumbnail_url: thumbnailUrl,
    is_live: true,
    published_at: stream.started_at,
    metadata: {
      streamId: stream.id,
      userId: stream.user_id,
      userName: stream.user_name,
      gameName: stream.game_name,
      viewerCount: stream.viewer_count,
    }
  }
}
