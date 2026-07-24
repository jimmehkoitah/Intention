'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, MessageSquare, Check } from 'lucide-react'
import {
  Person, PLATFORM_META, TIER_LABEL,
  avatar, agoLabel, isOverdue, pressure,
} from '@/lib/demo-data'

interface Props {
  person: Person | null
  onClose: () => void
  onLogContact: (id: string) => void
}

export default function PersonSheet({ person, onClose, onLogContact }: Props) {
  return (
    <AnimatePresence>
      {person && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose() }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-[#12121a] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" />

            <div className="px-5 pt-4 pb-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} className="text-white/50" />
              </button>

              <div className="flex items-center gap-3.5">
                <img
                  src={avatar(person.name)}
                  alt=""
                  className="w-16 h-16 rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${isOverdue(person) ? '#ef4444' : '#10b981'}` }}
                />
                <div className="min-w-0">
                  <h2 className="text-[20px] font-semibold text-white truncate">{person.name}</h2>
                  <p className="text-[13px] text-white/45">{TIER_LABEL[person.tier]}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {person.platforms.map(pl => (
                      <span
                        key={pl}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${PLATFORM_META[pl].color}22`, color: PLATFORM_META[pl].color }}
                      >
                        {PLATFORM_META[pl].name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connection health */}
              <div className="mt-5">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-white/45">Last contact</span>
                  <span className={isOverdue(person) ? 'text-red-400 font-medium' : 'text-white/70'}>
                    {agoLabel(person.daysSince)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, pressure(person) * 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: isOverdue(person) ? '#ef4444' : '#10b981' }}
                  />
                </div>
                <p className="text-[12px] text-white/35 mt-1.5">
                  You like to be in touch every {person.cadenceDays} days · usually by {person.method.toLowerCase()}
                </p>
              </div>

              {person.note && (
                <p className="mt-4 p-3 rounded-xl bg-white/[0.04] text-[13px] text-white/60 italic">
                  {person.note}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <Phone size={16} /> Call
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <MessageSquare size={16} /> Text
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onLogContact(person.id); onClose() }}
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 text-[15px] font-semibold text-white"
              >
                <Check size={17} /> I reached out
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
