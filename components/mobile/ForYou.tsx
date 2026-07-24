'use client'

import { motion } from 'framer-motion'
import { Radio, Trophy, Users } from 'lucide-react'
import {
  Person, Signal, SIGNALS, PLATFORM_META,
  avatar, thumbnail, agoLabel, isOverdue, pressure, personById,
} from '@/lib/demo-data'

interface Props {
  people: Person[]
  onPersonClick: (p: Person) => void
}

export default function ForYou({ people, onPersonClick }: Props) {
  const reconnect = [...people].sort((a, b) => pressure(b) - pressure(a)).slice(0, 6)
  const milestones = SIGNALS.filter(s => s.milestone)
  const live = SIGNALS.filter(s => s.live)
  const missed = SIGNALS.filter(s => !s.live && !s.milestone && s.platform !== 'discord')
  const presence = SIGNALS.filter(s => s.platform === 'discord')

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <Section
        title="Reconnect"
        subtitle="People you should reach out to"
      >
        {reconnect.map(p => (
          <ReconnectCard key={p.id} person={p} onClick={() => onPersonClick(p)} />
        ))}
      </Section>

      {milestones.length > 0 && (
        <Section
          title="Worth knowing"
          subtitle="Not routine activity — actual news"
          icon={<Trophy size={15} className="text-amber-400" />}
        >
          {milestones.map(s => (
            <MilestoneCard key={s.id} signal={s} onPersonClick={onPersonClick} people={people} />
          ))}
        </Section>
      )}

      {presence.length > 0 && (
        <Section title="Happening now" subtitle="Your people, together" icon={<Users size={15} className="text-indigo-400" />}>
          {presence.map(s => <PresenceCard key={s.id} signal={s} />)}
        </Section>
      )}

      <Section
        title="Live now"
        subtitle="From people you follow"
        icon={<span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--overdue)', boxShadow: '0 0 12px var(--overdue)' }} />}
      >
        {live.map(s => <SignalCard key={s.id} signal={s} />)}
      </Section>

      <Section title="You might have missed" subtitle="Since you last looked">
        {missed.map(s => <SignalCard key={s.id} signal={s} />)}
      </Section>
    </div>
  )
}

/* Horizontal, snap-scrolled, and deliberately finite — the anti-doomscroll rule. */
function Section({
  title, subtitle, icon, children,
}: {
  title: string; subtitle: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section className="mt-5 first:mt-3">
      <div className="px-4">
        <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-white">
          {icon}{title}
        </h2>
        <p className="text-[12px] text-white/[0.46] mt-[3px]">{subtitle}</p>
      </div>
      <div className="mt-2.5 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory no-scrollbar">
        {children}
        <div className="shrink-0 w-1" aria-hidden />
      </div>
    </section>
  )
}

function ReconnectCard({ person, onClick }: { person: Person; onClick: () => void }) {
  const over = isOverdue(person)
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`snap-start shrink-0 w-[134px] p-3.5 rounded-[20px] text-center glass holo sheen${over ? ' od' : ''}`}
      style={over ? {
        boxShadow: 'var(--glass-lip), var(--glass-drop), 0 0 28px rgba(255,93,115,.34)',
      } : undefined}
    >
      <img
        src={avatar(person.name)}
        alt=""
        className="w-14 h-14 rounded-full mx-auto"
        style={{
          boxShadow: over
            ? '0 0 0 2px var(--overdue), 0 0 20px rgba(255,93,115,.75)'
            : '0 0 0 2px var(--current), 0 0 20px rgba(46,230,168,.6)',
        }}
      />
      <p className="mt-2.5 text-[14px] font-semibold text-white truncate">{person.name}</p>
      <p className="text-[11px] leading-tight" style={{ color: over ? 'var(--overdue)' : 'rgba(255,255,255,.46)' }}>
        {agoLabel(person.daysSince)}
      </p>
      {over && <p className="text-[11px] font-bold" style={{ color: 'var(--overdue)' }}>Overdue</p>}
    </motion.button>
  )
}

function MilestoneCard({
  signal, people, onPersonClick,
}: {
  signal: Signal; people: Person[]; onPersonClick: (p: Person) => void
}) {
  const meta = PLATFORM_META[signal.platform]
  const person = people.find(p => p.id === signal.personId) ?? personById(signal.personId)
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => person && onPersonClick(person)}
      className="snap-start shrink-0 w-[290px] rounded-[20px] overflow-hidden text-left glass holo sheen milestone-rim"
      style={{ boxShadow: 'var(--glass-lip), var(--glass-drop), 0 0 34px rgba(255,200,107,.3)' }}
    >
      <div className="flex items-center gap-3 p-3">
        <img
          src={avatar(signal.author)}
          alt=""
          className="w-12 h-12 rounded-full"
          style={{ boxShadow: '0 0 0 2px var(--milestone), 0 0 22px rgba(255,200,107,.75)' }}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: 'var(--milestone)' }}>
            {signal.author.split(' ')[0]}&rsquo;s first marathon
          </p>
          <p className="text-[14px] font-semibold text-white truncate">{signal.title}</p>
          <p className="text-[12px] text-white/50 truncate">{signal.subtitle}</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <span className="inline-block text-[12px] font-bold" style={{ color: 'var(--milestone)' }}>
          Say something →
        </span>
      </div>
    </motion.button>
  )
}

function PresenceCard({ signal }: { signal: Signal }) {
  const meta = PLATFORM_META[signal.platform]
  return (
    <div
      className="snap-start shrink-0 w-[246px] p-3.5 rounded-[20px] glass holo presence-rim"
    >
      <p className="text-[14px] font-semibold text-white">{signal.title}</p>
      <p className="text-[12px] text-white/50 mt-0.5">{signal.subtitle}</p>
      <div className="flex -space-x-2 mt-2.5">
        {['Maya Rodriguez', 'Bo Kim', 'Chris Okafor', 'Devin Park'].map(n => (
          <img
            key={n}
            src={avatar(n)}
            alt=""
            className="w-7 h-7 rounded-full border-2"
            style={{ borderColor: 'rgba(20,16,40,.9)' }}
          />
        ))}
      </div>
    </div>
  )
}

function SignalCard({ signal }: { signal: Signal }) {
  const meta = PLATFORM_META[signal.platform]
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={`snap-start shrink-0 w-[238px] rounded-[20px] overflow-hidden glass holo${signal.live ? ' holo-live' : ''}`}
    >
      <div className="relative">
        <img src={thumbnail(signal.id, meta.color, meta.lit)} alt="" className="w-full aspect-video object-cover" />
        {signal.live && (
          <span
            className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold tracking-[0.05em] text-white"
            style={{
              background: 'linear-gradient(180deg, #ff7a8a, #ff2d4e)',
              boxShadow: '0 4px 14px rgba(255,45,78,.6)',
            }}
          >
            <Radio size={9} /> LIVE
          </span>
        )}
        <span
          className="absolute top-2 right-2 z-10 w-[25px] h-[25px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            background: `linear-gradient(160deg, ${meta.lit}, ${meta.color})`,
            boxShadow: '0 3px 12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)',
          }}
        >
          {meta.name[0]}
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-[13px] font-medium text-white leading-snug line-clamp-2">{signal.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <img src={avatar(signal.author)} alt="" className="w-5 h-5 rounded-full" />
          <span className="text-[11px] text-white/45 truncate flex-1">{signal.author}</span>
          <span className="text-[11px] text-white/35 shrink-0">
            {signal.live && signal.viewers ? `${(signal.viewers / 1000).toFixed(1)}K` : signal.when}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
