'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlatformOrb from './PlatformOrb'
import PersonOrb from './PersonOrb'
import { Platform, MOCK_PEOPLE, MOCK_SIGNALS } from '@/lib/types'

interface ConstellationProps {
  connectedPlatforms: Platform[]
  activePlatforms: Platform[]
  onPlatformClick: (platform: Platform) => void
  onPersonClick: (personId: string) => void
  onConnectPlatform: (platform: Platform) => void
}

export default function Constellation({
  connectedPlatforms,
  activePlatforms,
  onPlatformClick,
  onPersonClick,
  onConnectPlatform,
}: ConstellationProps) {
  const platforms: Platform[] = ['youtube', 'github', 'twitch', 'discord', 'strava']

  // Calculate which platforms have live content
  const platformsWithLive = MOCK_SIGNALS.filter(s => s.isLive).map(s => s.platform)

  // Get signal counts per platform
  const signalCounts = platforms.reduce((acc, p) => {
    acc[p] = MOCK_SIGNALS.filter(s => s.platform === p).length
    return acc
  }, {} as Record<Platform, number>)

  // Get people who need attention (overdue)
  const peopleNeedingAttention = MOCK_PEOPLE.filter(person => {
    if (!person.lastContactAt) return true
    const daysSince = Math.floor((Date.now() - person.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= person.frequencyDays
  })

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Central sun (user) */}
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center z-10"
        style={{
          boxShadow: '0 0 40px rgba(147, 51, 234, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 40px rgba(147, 51, 234, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)',
            '0 0 60px rgba(147, 51, 234, 0.6), 0 0 100px rgba(147, 51, 234, 0.4)',
            '0 0 40px rgba(147, 51, 234, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-white font-bold text-lg">You</span>
      </motion.div>

      {/* Platform orbs - inner orbit */}
      {platforms.map((platform, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180) // Start from top, 72 degrees apart
        const radius = 100
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const isConnected = connectedPlatforms.includes(platform)

        return (
          <motion.div
            key={platform}
            className={`absolute float-${(i % 3) + 1}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <PlatformOrb
              platform={platform}
              connected={isConnected}
              active={activePlatforms.includes(platform)}
              hasLive={platformsWithLive.includes(platform)}
              signalCount={isConnected ? signalCounts[platform] : 0}
              onClick={() =>
                isConnected ? onPlatformClick(platform) : onConnectPlatform(platform)
              }
              size="md"
            />
          </motion.div>
        )
      })}

      {/* Person orbs - outer orbit (only show people needing attention) */}
      {peopleNeedingAttention.slice(0, 5).map((person, i) => {
        const angle = ((i * 72) + 36 - 90) * (Math.PI / 180) // Offset from platform orbs
        const radius = 160
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const daysSince = person.lastContactAt
          ? Math.floor((Date.now() - person.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999
        const isUrgent = daysSince >= person.frequencyDays

        return (
          <motion.div
            key={person.id}
            className={`absolute float-${((i + 1) % 3) + 1}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <PersonOrb
              person={person}
              daysSinceContact={daysSince}
              isUrgent={isUrgent}
              onClick={() => onPersonClick(person.id)}
            />
          </motion.div>
        )
      })}

      {/* Orbital rings (decorative) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        <circle
          cx="50%"
          cy="50%"
          r="100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle
          cx="50%"
          cy="50%"
          r="160"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  )
}
