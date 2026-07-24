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
        icon={<span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
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
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-white">
          {icon}{title}
        </h2>
        <p className="text-[12px] text-white/40 mt-0.5">{subtitle}</p>
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
      className="snap-start shrink-0 w-[132px] p-3 rounded-2xl border text-center"
      style={{
        background: over ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)',
        borderColor: over ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <img
        src={avatar(person.name)}
        alt=""
        className="w-14 h-14 rounded-full mx-auto"
        style={{ boxShadow: `0 0 0 2px ${over ? '#ef4444' : '#10b981'}` }}
      />
      <p className="mt-2 text-[14px] font-semibold text-white truncate">{person.name}</p>
      <p className={`text-[11px] leading-tight ${over ? 'text-red-400' : 'text-white/45'}`}>
        {agoLabel(person.daysSince)}
      </p>
      {over && <p className="text-[11px] text-red-400 font-medium">Overdue</p>}
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
      className="snap-start shrink-0 w-[280px] rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] overflow-hidden text-left"
    >
      <div className="flex items-center gap-3 p-3">
        <img
          src={avatar(signal.author)}
          alt=""
          className="w-12 h-12 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${meta.color}` }}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">
            {signal.author.split(' ')[0]}&rsquo;s first marathon
          </p>
          <p className="text-[14px] font-semibold text-white truncate">{signal.title}</p>
          <p className="text-[12px] text-white/50 truncate">{signal.subtitle}</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <span className="inline-block text-[12px] font-medium text-amber-300">
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
      className="snap-start shrink-0 w-[240px] p-3 rounded-2xl border"
      style={{ borderColor: `${meta.color}44`, background: `${meta.color}14` }}
    >
      <p className="text-[14px] font-semibold text-white">{signal.title}</p>
      <p className="text-[12px] text-white/50 mt-0.5">{signal.subtitle}</p>
      <div className="flex -space-x-2 mt-2.5">
        {['Maya Rodriguez', 'Bo Kim', 'Chris Okafor', 'Devin Park'].map(n => (
          <img
            key={n}
            src={avatar(n)}
            alt=""
            className="w-7 h-7 rounded-full border-2 border-[#12121a]"
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
      className="snap-start shrink-0 w-[240px] rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden"
    >
      <div className="relative">
        <img src={thumbnail(signal.id, meta.color)} alt="" className="w-full aspect-video object-cover" />
        {signal.live && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-bold text-white">
            <Radio size={9} /> LIVE
          </span>
        )}
        <span
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: meta.color }}
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
