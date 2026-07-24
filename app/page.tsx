'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import OrbField from '@/components/mobile/OrbField'
import ForYou from '@/components/mobile/ForYou'
import PersonSheet from '@/components/mobile/PersonSheet'
import Aurora from '@/components/mobile/Aurora'
import { PEOPLE, Person, isOverdue } from '@/lib/demo-data'

type Tab = 'discovery' | 'foryou'

export default function Home() {
  const [tab, setTab] = useState<Tab>('discovery')
  const [people, setPeople] = useState<Person[]>(PEOPLE)
  const [selected, setSelected] = useState<Person | null>(null)
  const [toast, setToast] = useState<string | null>(null)

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
            ? <OrbField people={people} onPersonClick={setSelected} />
            : <ForYou people={people} onPersonClick={setSelected} />}
        </motion.div>
      </AnimatePresence>

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
