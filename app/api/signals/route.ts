import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as youtube from '@/lib/platforms/youtube'
import * as github from '@/lib/platforms/github'
import * as twitch from '@/lib/platforms/twitch'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const signals: any[] = []

    // Check YouTube connection
    const youtubeTokens = cookieStore.get('youtube_tokens')
    if (youtubeTokens) {
      try {
        const tokens = JSON.parse(youtubeTokens.value)

        // Check if token is expired
        if (tokens.expires_at > Date.now()) {
          // Get subscriptions
          const subscriptions = await youtube.getSubscriptions(tokens.access_token)
          const channelIds = subscriptions.map(s => s.snippet.resourceId.channelId)

          // Get videos from subscriptions
          const videos = await youtube.getSubscriptionVideos(tokens.access_token, channelIds.slice(0, 10))

          // Transform to signals
          for (const video of videos) {
            signals.push(youtube.transformToSignal(video))
          }

          // Get live streams
          const liveStreams = await youtube.getLiveStreams(tokens.access_token)
          for (const stream of liveStreams) {
            signals.push(youtube.transformToSignal(stream))
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube signals:', err)
      }
    }

    // Check GitHub connection (similar pattern)
    const githubTokens = cookieStore.get('github_tokens')
    if (githubTokens) {
      try {
        const tokens = JSON.parse(githubTokens.value)
        const events = await github.getFollowingActivity(tokens.access_token)

        for (const event of events) {
          signals.push(github.transformToSignal(event))
        }
      } catch (err) {
        console.error('Error fetching GitHub signals:', err)
      }
    }

    // Sort by date
    signals.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )

    return NextResponse.json({ signals })
  } catch (err) {
    console.error('Error in signals API:', err)
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
  }
}
