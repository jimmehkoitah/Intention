import Link from 'next/link'
import { ArrowLeft, Github, Twitch, Youtube, MessageCircle, Activity, Check, AlertCircle } from 'lucide-react'
import Aurora from '@/components/mobile/Aurora'
import { getUser, isConfigured } from '@/lib/supabase/server'
import { listConnections } from '@/lib/connections'
import { PLATFORM_META, type Platform } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

const ICONS = {
  github: Github,
  twitch: Twitch,
  youtube: Youtube,
  discord: MessageCircle,
  strava: Activity,
} as const

type Available = keyof typeof ICONS

/** Only GitHub is wired end to end; the rest are honest about their status. */
const PLATFORMS: Array<{ id: Available; blurb: string; ready: boolean; note?: string }> = [
  { id: 'github', blurb: 'Commits, pull requests and releases from people you follow', ready: true },
  { id: 'twitch', blurb: 'Live streams from channels you follow', ready: false, note: 'Needs 2FA on your Twitch account before the app can be registered' },
  { id: 'youtube', blurb: 'Uploads and live streams from your subscriptions', ready: false, note: 'Not wired up yet' },
  { id: 'discord', blurb: 'Who is in a voice channel right now', ready: false, note: 'Requires installing a bot per server' },
  { id: 'strava', blurb: 'Runs and rides from your friends', ready: false, note: 'Pending a check of their API terms' },
]

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string }
}) {
  const configured = isConfigured()
  const user = configured ? await getUser() : null
  const connections = user ? await listConnections() : []
  const connected = new Map(connections.map(c => [c.platform, c]))

  return (
    <div className="min-h-screen text-white isolate relative overflow-x-hidden" style={{ background: '#07060f' }}>
      <Aurora />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-[max(20px,env(safe-area-inset-top))] pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-white/50 hover:text-white/80">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="mt-5 text-[26px] font-bold tracking-[-0.02em]">Connections</h1>
        <p className="mt-1.5 text-[14px] text-white/50">
          Connect a platform to replace the sample data with your actual network.
        </p>

        {searchParams.connected && (
          <Banner tone="ok">
            Connected {searchParams.connected}. Your feed is live —{' '}
            <Link href="/" className="underline">open it</Link>.
          </Banner>
        )}
        {searchParams.error && <Banner tone="bad">{searchParams.error}</Banner>}

        {!configured && (
          <Banner tone="warn">
            Supabase isn&rsquo;t configured on this deployment, so connections can&rsquo;t be saved.
          </Banner>
        )}

        {configured && !user && (
          <Banner tone="warn">
            <Link href="/login?next=/integrations" className="underline font-semibold">Sign in</Link>{' '}
            to connect a platform. Your tokens are stored against your account and readable only by you.
          </Banner>
        )}

        <div className="mt-6 space-y-3">
          {PLATFORMS.map(p => {
            const Icon = ICONS[p.id]
            const meta = PLATFORM_META[p.id as Platform]
            const live = connected.get(p.id)
            const canConnect = configured && user && p.ready

            return (
              <div key={p.id} className="p-4 rounded-[20px] glass holo">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl grid place-items-center shrink-0"
                    style={{
                      background:
                        `radial-gradient(circle at 32% 26%, rgba(255,255,255,.5), rgba(255,255,255,0) 46%),` +
                        `linear-gradient(155deg, ${meta.lit}, ${meta.color} 62%)`,
                      boxShadow: `0 6px 18px ${meta.glow}`,
                    }}
                  >
                    <Icon size={20} color="#fff" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-semibold">{meta.name}</span>
                      {live && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(46,230,168,.18)', color: 'var(--current)' }}
                        >
                          <Check size={10} strokeWidth={3} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-white/50 mt-0.5 leading-snug">{p.blurb}</p>
                    {live?.platform_username && (
                      <p className="text-[12px] text-white/40 mt-1">as @{live.platform_username}</p>
                    )}
                    {!p.ready && p.note && (
                      <p className="text-[11.5px] text-amber-300/70 mt-1.5">{p.note}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3.5">
                  {live ? (
                    <a
                      href={`/api/auth/${p.id}/disconnect`}
                      className="block w-full py-2.5 rounded-xl border border-white/20 text-center text-[13px] font-semibold text-white/70 hover:text-white"
                      style={{ background: 'rgba(255,255,255,.06)' }}
                    >
                      Disconnect
                    </a>
                  ) : canConnect ? (
                    <a
                      href={`/api/auth/${p.id}`}
                      className="block w-full py-2.5 rounded-xl text-center text-[13px] font-bold"
                      style={{
                        background:
                          'radial-gradient(120% 160% at 22% 0%, rgba(255,255,255,.34), transparent 62%),' +
                          'linear-gradient(92deg, #8b5cf6, #6366f1 46%, #22d3ee)',
                        boxShadow: '0 8px 22px rgba(139,92,246,.45), inset 0 1px 0 rgba(255,255,255,.4)',
                      }}
                    >
                      Connect {meta.name}
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border border-white/[0.12] text-[13px] font-semibold text-white/30 cursor-not-allowed"
                    >
                      {p.ready ? 'Sign in first' : 'Coming soon'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-7 text-[12px] text-white/35 leading-relaxed">
          Access tokens are stored against your account with row-level security, and this app holds
          no key that can bypass it. Disconnecting deletes the stored token.
        </p>
      </div>
    </div>
  )
}

function Banner({ tone, children }: { tone: 'ok' | 'bad' | 'warn'; children: React.ReactNode }) {
  const styles = {
    ok: { border: 'rgba(46,230,168,.45)', bg: 'rgba(46,230,168,.10)', fg: '#8af5d2' },
    bad: { border: 'rgba(255,93,115,.45)', bg: 'rgba(255,93,115,.10)', fg: '#ffb3bd' },
    warn: { border: 'rgba(255,200,107,.45)', bg: 'rgba(255,200,107,.10)', fg: '#ffdca6' },
  }[tone]

  return (
    <div
      className="mt-5 p-3.5 rounded-2xl flex gap-2.5 border text-[13px]"
      style={{ borderColor: styles.border, background: styles.bg, color: styles.fg }}
    >
      {tone === 'ok'
        ? <Check size={16} className="shrink-0 mt-0.5" />
        : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
      <div>{children}</div>
    </div>
  )
}
