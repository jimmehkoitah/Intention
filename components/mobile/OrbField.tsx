'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Github, Twitch, MessageCircle, Activity, Phone, X, Radio } from 'lucide-react'
import {
  Platform, PLATFORM_META, Person, Signal,
  avatar, agoLabel, isOverdue,
} from '@/lib/demo-data'

const ICONS: Record<Platform, typeof Youtube> = {
  youtube: Youtube,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  strava: Activity,
  contacts: Phone,
}

/**
 * Resting positions as a fraction of the field, roughly the prototype's layout.
 * These are applied as CSS percentages so the orbs paint correctly on the very
 * first frame — before any measurement has happened. Dragging then layers a
 * pixel delta on top.
 */
const LAYOUT: Array<{ id: Platform; fx: number; fy: number }> = [
  { id: 'youtube', fx: 0.26, fy: 0.16 },
  { id: 'github', fx: 0.66, fy: 0.30 },
  { id: 'contacts', fx: 0.28, fy: 0.48 },
  { id: 'twitch', fx: 0.82, fy: 0.60 },
  { id: 'discord', fx: 0.33, fy: 0.73 },
  { id: 'strava', fx: 0.62, fy: 0.88 },
]

const ORB = 76
const PANEL_W = 260
/** Total panel height budget including its header, used to keep it on-screen. */
const PANEL_H = 246
const PANEL_HEADER = 38

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

interface Props {
  people: Person[]
  signals: Signal[]
  onPersonClick: (p: Person) => void
}

export default function OrbField({ people, signals, onPersonClick }: Props) {
  const forPlatform = (id: Platform) =>
    id === 'contacts' ? [] : signals.filter(s => s.platform === id)

  const fieldRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [drag, setDrag] = useState<Record<string, { dx: number; dy: number }>>({})
  const [expanded, setExpanded] = useState<Platform[]>([])
  const dragging = useRef(false)

  // Measurement is only needed to position panels and clamp drags — never to
  // decide whether an orb renders.
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toggle = useCallback((id: Platform) => {
    if (dragging.current) return
    setExpanded(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }, [])

  const overdue = people.filter(isOverdue)

  return (
    <div ref={fieldRef} className="relative flex-1 overflow-hidden">
      {LAYOUT.map(({ id, fx, fy }) => {
        const meta = PLATFORM_META[id]
        const Icon = ICONS[id]
        const d = drag[id] ?? { dx: 0, dy: 0 }

        const isOpen = expanded.includes(id)
        const platformSignals = forPlatform(id)
        const live = platformSignals.filter(s => s.live).length
        const badge = id === 'contacts' ? overdue.length : live

        // Current pixel centre, used only for panel placement.
        const px = fx * size.w - ORB / 2 + d.dx
        const py = fy * Math.max(0, size.h - ORB) + d.dy

        const panelW = Math.min(PANEL_W, Math.max(180, size.w - 16))
        const panelLeft = clamp(px + ORB / 2 - panelW / 2, 8, Math.max(8, size.w - panelW - 8))
        const below = py + ORB + 12
        const preferred = below + PANEL_H > size.h ? py - PANEL_H - 12 : below
        const panelTop = clamp(preferred, 8, Math.max(8, size.h - PANEL_H - 8))
        const listMaxH = Math.max(
          96,
          Math.min(PANEL_H - PANEL_HEADER, size.h - panelTop - PANEL_HEADER - 16)
        )
        // Most recently opened panel wins the stacking order.
        const z = 20 + expanded.indexOf(id)

        return (
          <div key={id}>
            <motion.button
              drag
              dragMomentum={false}
              dragConstraints={fieldRef}
              dragElastic={0.05}
              onDragStart={() => { dragging.current = true }}
              onDragEnd={(_, info) => {
                setDrag(prev => {
                  const cur = prev[id] ?? { dx: 0, dy: 0 }
                  const baseX = fx * size.w - ORB / 2
                  const baseY = fy * Math.max(0, size.h - ORB)
                  const nx = clamp(baseX + cur.dx + info.offset.x, 4, Math.max(4, size.w - ORB - 4))
                  const ny = clamp(baseY + cur.dy + info.offset.y, 4, Math.max(4, size.h - ORB - 4))
                  return { ...prev, [id]: { dx: nx - baseX, dy: ny - baseY } }
                })
                // Let the click handler observe the drag before it clears.
                setTimeout(() => { dragging.current = false }, 0)
              }}
              onClick={() => toggle(id)}
              animate={{ x: d.dx, y: d.dy, scale: isOpen ? 0.84 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileTap={{ scale: 0.92 }}
              style={{
                position: 'absolute',
                left: `calc(${fx * 100}% - ${ORB / 2}px)`,
                top: `calc(${fy * 100}% - ${fy * ORB}px)`,
                width: ORB, height: ORB, borderRadius: ORB,
                background:
                  `radial-gradient(circle at 32% 26%, rgba(255,255,255,.62), rgba(255,255,255,0) 46%),` +
                  `linear-gradient(155deg, ${meta.lit}, ${meta.color} 62%)`,
                boxShadow:
                  `0 10px 26px rgba(0,0,0,.45), 0 0 42px ${meta.glow}, inset 0 -6px 14px rgba(0,0,0,.28)`,
                touchAction: 'none',
              }}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing"
              aria-label={meta.name}
            >
              <Icon size={32} color="#fff" strokeWidth={2} />
              {badge > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-[11px] font-bold flex items-center justify-center"
                  style={{ color: id === 'github' ? '#111' : meta.color }}
                >
                  {badge}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  style={{
                    position: 'absolute',
                    left: panelLeft, top: panelTop, width: panelW, zIndex: z,
                  }}
                  className={`rounded-[20px] overflow-hidden glass holo${live > 0 ? ' holo-live' : ''}`}
                >
                  <div
                    className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.14]"
                    style={{ background: `linear-gradient(92deg, ${meta.color}4d, ${meta.color}14)` }}
                  >
                    <span className="text-sm font-semibold text-white">{meta.name}</span>
                    <button
                      onClick={() => toggle(id)}
                      className="p-1 rounded-full hover:bg-white/10"
                      aria-label={`Close ${meta.name}`}
                    >
                      <X size={14} className="text-white/60" />
                    </button>
                  </div>

                  <div className="overflow-y-auto p-2 space-y-1.5" style={{ maxHeight: listMaxH }}>
                    {id === 'contacts'
                      ? <ContactList people={people} onPersonClick={onPersonClick} />
                      : <SignalList signals={platformSignals} lit={meta.lit} />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      <p className="absolute bottom-3 inset-x-0 text-center text-[11px] text-white/25 pointer-events-none">
        Drag to rearrange · tap to open
      </p>
    </div>
  )
}

function SignalList({ signals, lit }: { signals: Signal[]; lit: string }) {
  if (!signals.length) {
    return <p className="px-2 py-6 text-center text-xs text-white/30">Nothing new here.</p>
  }
  return (
    <>
      {signals.map(s => (
        <div
          key={s.id}
          className="sheen relative flex gap-2.5 p-2.5 rounded-2xl border border-white/[0.13]"
          style={{
            background: 'linear-gradient(150deg, rgba(255,255,255,.12), rgba(255,255,255,.04))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.24)',
          }}
        >
          <img src={s.avatarUrl ?? avatar(s.author)} alt="" className="w-9 h-9 rounded-full shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white leading-snug truncate">{s.title}</p>
            <p className="text-[11px] text-white/45 truncate">{s.author}</p>
            {/* Platform colour signals "live"; a plain timestamp must stay muted,
                otherwise an ordinary YouTube upload reads as an alert. */}
            <p
              className="text-[11px] mt-0.5 flex items-center gap-1 font-medium"
              style={{ color: s.live ? lit : 'rgba(255,255,255,0.46)' }}
            >
              {s.live && <Radio size={10} className="animate-pulse" />}
              {s.live && s.viewers ? `${s.viewers.toLocaleString()} watching` : s.when}
            </p>
          </div>
        </div>
      ))}
    </>
  )
}

function ContactList({ people, onPersonClick }: { people: Person[]; onPersonClick: (p: Person) => void }) {
  const sorted = [...people].sort((a, b) => b.daysSince / b.cadenceDays - a.daysSince / a.cadenceDays)
  return (
    <>
      {sorted.slice(0, 6).map(p => {
        const over = isOverdue(p)
        return (
          <button
            key={p.id}
            onClick={() => onPersonClick(p)}
            className="sheen relative w-full flex items-center gap-2.5 p-2.5 rounded-2xl border border-white/[0.13] text-left transition-transform active:scale-[.98]"
            style={{
              background: 'linear-gradient(150deg, rgba(255,255,255,.12), rgba(255,255,255,.04))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.24)',
            }}
          >
            <img
              src={avatar(p.name)}
              alt=""
              className="w-9 h-9 rounded-full shrink-0"
              style={{
                boxShadow: over
                  ? '0 0 0 2px var(--overdue), 0 0 14px rgba(255,93,115,.7)'
                  : '0 0 0 2px var(--current), 0 0 14px rgba(46,230,168,.6)',
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white truncate">{p.name}</p>
              <p className="text-[11px] truncate" style={{ color: over ? 'var(--overdue)' : 'rgba(255,255,255,.46)' }}>
                {agoLabel(p.daysSince)}{over ? ' · overdue' : ''}
              </p>
            </div>
          </button>
        )
      })}
    </>
  )
}
