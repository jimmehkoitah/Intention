'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Github, Twitch, MessageCircle, Activity, Phone, X, Radio } from 'lucide-react'
import {
  Platform, PLATFORM_META, Person, Signal,
  signalsFor, avatar, agoLabel, isOverdue,
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
  onPersonClick: (p: Person) => void
}

export default function OrbField({ people, onPersonClick }: Props) {
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
        const live = signalsFor(id).filter(s => s.live).length
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
                background: id === 'github' ? '#1c1c22' : meta.color,
                boxShadow: `0 0 34px ${meta.glow}`,
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
                    borderColor: `${meta.color}55`,
                    boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 24px ${meta.glow}`,
                  }}
                  className="rounded-2xl border bg-[#12121a]/95 backdrop-blur-xl overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-3 py-2 border-b border-white/10"
                    style={{ background: `${meta.color}22` }}
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
                      : <SignalList signals={signalsFor(id)} color={meta.color} />}
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

function SignalList({ signals, color }: { signals: Signal[]; color: string }) {
  if (!signals.length) {
    return <p className="px-2 py-6 text-center text-xs text-white/30">Nothing new here.</p>
  }
  return (
    <>
      {signals.map(s => (
        <div key={s.id} className="flex gap-2.5 p-2 rounded-xl bg-white/[0.04]">
          <img src={avatar(s.author)} alt="" className="w-9 h-9 rounded-full shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white leading-snug truncate">{s.title}</p>
            <p className="text-[11px] text-white/45 truncate">{s.author}</p>
            {/* Platform colour signals "live"; a plain timestamp must stay muted,
                otherwise an ordinary YouTube upload reads as an alert. */}
            <p
              className="text-[11px] mt-0.5 flex items-center gap-1"
              style={{ color: s.live ? color : 'rgba(255,255,255,0.4)' }}
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
            className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
          >
            <img
              src={avatar(p.name)}
              alt=""
              className="w-9 h-9 rounded-full shrink-0"
              style={{ boxShadow: over ? '0 0 0 2px #ef4444' : '0 0 0 2px #10b981' }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white truncate">{p.name}</p>
              <p className={`text-[11px] truncate ${over ? 'text-red-400' : 'text-white/45'}`}>
                {agoLabel(p.daysSince)}{over ? ' · overdue' : ''}
              </p>
            </div>
          </button>
        )
      })}
    </>
  )
}
