'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SignalCard from './SignalCard'
import { Platform, MockSignal, MOCK_SIGNALS } from '@/lib/types'

interface SignalFeedProps {
  activePlatforms: Platform[]
  onPinSignal: (signal: MockSignal) => void
  pinnedSignalId?: string
}

export default function SignalFeed({ activePlatforms, onPinSignal, pinnedSignalId }: SignalFeedProps) {
  // Filter signals based on active platforms
  const filteredSignals = activePlatforms.length > 0
    ? MOCK_SIGNALS.filter(s => activePlatforms.includes(s.platform))
    : MOCK_SIGNALS

  // Separate live and regular signals
  const liveSignals = filteredSignals.filter(s => s.isLive)
  const regularSignals = filteredSignals.filter(s => !s.isLive)

  // Sort regular signals by date
  regularSignals.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return (
    <div className="space-y-6">
      {/* Live Now Section */}
      {liveSignals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="live-badge">LIVE</div>
            <span className="text-sm text-white/60">{liveSignals.length} streams now</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {liveSignals.map((signal, i) => (
                <motion.div
                  key={signal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SignalCard
                    signal={signal}
                    onPin={() => onPinSignal(signal)}
                    isPinned={signal.id === pinnedSignalId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-sm font-medium text-white/60 mb-3">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {regularSignals.map((signal, i) => (
              <motion.div
                key={signal.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <SignalCard
                  signal={signal}
                  onPin={() => onPinSignal(signal)}
                  isPinned={signal.id === pinnedSignalId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty state */}
      {filteredSignals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/40">No signals from selected platforms</p>
          <p className="text-white/20 text-sm mt-1">
            {activePlatforms.length === 0
              ? 'Select a platform to see activity'
              : 'Connect more accounts to see more content'}
          </p>
        </div>
      )}
    </div>
  )
}
