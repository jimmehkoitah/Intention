'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import OrbField from '@/components/mobile/OrbField'
import ForYou from '@/components/mobile/ForYou'
import PersonSheet from '@/components/mobile/PersonSheet'
import Aurora from '@/components/mobile/Aurora'
import { PEOPLE, SIGNALS, Person, isOverdue } from '@/lib/demo-data'
import { useSignals } from '@/lib/use-signals'

type Tab = 'discovery' | 'foryou'

export default function Home() {
  const [tab, setTab] = useState<Tab>('discovery')
  const [people, setPeople] = useState<Person[]>(PEOPLE)
  const [selected, setSelected] = useState<Person | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const feed = useSignals()

  // Live data replaces the sample set once a platform is connected. Until then
  // the demo stands in, so the app is never an empty shell.
  const isLive = feed.status === 'ok' && feed.signals.length > 0
  const signals = isLive ? feed.signals : SIGNALS

  // Logging a contact resets the clock — the one piece of state that makes the
  // demo feel alive rather than static.
  const logContact = (id: string) => {
    const person = people.find(p => p.id === id)
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, daysSince: 0 } : p)))
    setToast(person ? `Logged — you're current with ${person.name}` : 'Logged')
    setTimeout(() => setToast(null), 2600)
  }

  const overdueCount = people.filter(isOverdue).length

  return (
    <div className="fixed inset-0 flex flex-col text-white isolate" style={{ background: '#07060f' }}>
      <Aurora />

      {/* Header */}
      <header className="relative z-10 shrink-0 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-base font-bold">I</span>
            </div>
            <span className="text-[22px] font-bold bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              Intention
            </span>
          </div>
          <button
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            style={{ boxShadow: 'var(--glass-lip)' }}
            aria-label="Search"
          >
            <Search size={18} className="text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {(['discovery', 'foryou'] as Tab[]).map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative py-3 rounded-[17px] text-[15px] font-semibold transition-colors border ${
                  active
                    ? 'text-white border-transparent'
                    : 'text-white/50 border-white/[0.16] bg-white/[0.06] backdrop-blur-xl'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-[17px]"
                    style={{
                      background:
                        'radial-gradient(120% 160% at 20% 0%, rgba(255,255,255,.34), transparent 60%),' +
                        'linear-gradient(92deg, #8b5cf6, #6366f1 46%, #22d3ee)',
                      boxShadow: '0 10px 30px rgba(139,92,246,.55), inset 0 1px 0 rgba(255,255,255,.42)',
                    }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-1.5">
                  {t === 'discovery' ? 'Discovery' : 'For You'}
                  {t === 'foryou' && overdueCount > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
                        active ? 'bg-white/30 text-white' : 'text-white'
                      }`}
                      style={active ? undefined : {
                        background: 'linear-gradient(180deg, #ff7a8a, var(--overdue))',
                        boxShadow: '0 3px 12px rgba(255,93,115,.6)',
                      }}
                    >
                      {overdueCount}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'discovery' ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 flex-1 flex flex-col min-h-0"
        >
          {tab === 'discovery'
            ? <OrbField people={people} signals={signals} onPersonClick={setSelected} />
            : <ForYou people={people} signals={signals} onPersonClick={setSelected} />}
        </motion.div>
      </AnimatePresence>

      <FeedStatusStrip status={feed.status} account={feed.account} error={feed.error} live={isLive} />

      <PersonSheet person={selected} onClose={() => setSelected(null)} onLogContact={logContact} />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-8 inset-x-4 z-[60] py-3.5 px-4 rounded-[18px] text-center text-[14px] font-bold"
            style={{
              background: 'linear-gradient(92deg, rgba(46,230,168,.94), rgba(34,211,238,.94))',
              color: '#04231b',
              boxShadow: '0 16px 42px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.5)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * States the strip. Never claims the feed is real when it isn't — an empty or
 * sample feed presented as live would be worse than saying nothing.
 */
function FeedStatusStrip({
  status, account, error, live,
}: {
  status: string; account?: string; error?: string; live: boolean
}) {
  if (status === 'loading') return null

  let text: React.ReactNode = null
  let tone: 'live' | 'muted' | 'bad' = 'muted'

  if (live) {
    text = <>Live from GitHub{account ? <> · @{account}</> : null}</>
    tone = 'live'
  } else if (status === 'signed_out' || status === 'unconfigured') {
    text = <>Sample data · <a href="/login" className="underline">sign in</a> to see your own</>
  } else if (status === 'no_connections') {
    text = <>Sample data · <a href="/integrations" className="underline">connect GitHub</a></>
  } else if (status === 'reauth_required') {
    text = <><a href="/integrations" className="underline">Reconnect GitHub</a> — the token expired</>
    tone = 'bad'
  } else if (status === 'error') {
    text = <>Couldn&rsquo;t load your feed: {error ?? 'unknown error'}</>
    tone = 'bad'
  } else if (status === 'ok') {
    text = <>GitHub connected, but your network has been quiet · showing sample data</>
  }

  if (!text) return null

  const colour =
    tone === 'live' ? 'var(--current)' : tone === 'bad' ? 'var(--overdue)' : 'rgba(255,255,255,.5)'

  return (
    <div className="relative z-10 shrink-0 px-4 pb-[max(8px,env(safe-area-inset-bottom))]">
      <p className="flex items-center justify-center gap-1.5 text-[11.5px]" style={{ color: colour }}>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: colour, boxShadow: tone === 'live' ? `0 0 8px ${colour}` : undefined }}
        />
        {text}
      </p>
    </div>
  )
}
