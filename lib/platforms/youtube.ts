// YouTube API adapter
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

interface YouTubeSubscription {
  id: string
  snippet: {
    title: string
    description: string
    resourceId: { channelId: string }
    thumbnails: { default: { url: string } }
  }
}

interface YouTubeVideo {
  id: string
  snippet: {
    title: string
    description: string
    channelTitle: string
    channelId: string
    publishedAt: string
    thumbnails: { medium: { url: string } }
    liveBroadcastContent: 'live' | 'upcoming' | 'none'
  }
}

export async function getSubscriptions(accessToken: string) {
  const response = await fetch(
    `${YOUTUBE_API_BASE}/subscriptions?part=snippet&mine=true&maxResults=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.items as YouTubeSubscription[]
}

export async function getSubscriptionVideos(accessToken: string, channelIds: string[]) {
  // Get recent videos from subscribed channels
  const videos: YouTubeVideo[] = []

  // Batch channels to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize)

    for (const channelId of batch) {
      try {
        const response = await fetch(
          `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=5`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          videos.push(...data.items)
        }
      } catch (error) {
        console.error(`Error fetching videos for channel ${channelId}:`, error)
      }
    }
  }

  return videos
}

export async function getLiveStreams(accessToken: string) {
  const response = await fetch(
    `${YOUTUBE_API_BASE}/search?part=snippet&eventType=live&type=video&maxResults=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.items as YouTubeVideo[]
}

export function transformToSignal(video: YouTubeVideo) {
  return {
    platform: 'youtube' as const,
    signal_type: video.snippet.liveBroadcastContent === 'live' ? 'stream' : 'video',
    title: video.snippet.title,
    description: video.snippet.description?.slice(0, 200),
    url: `https://youtube.com/watch?v=${video.id}`,
    thumbnail_url: video.snippet.thumbnails?.medium?.url,
    is_live: video.snippet.liveBroadcastContent === 'live',
    published_at: video.snippet.publishedAt,
    metadata: {
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
    }
  }
}
