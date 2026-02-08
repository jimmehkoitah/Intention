'use client'

import { motion } from 'framer-motion'
import { Phone, MessageSquare, AlertCircle } from 'lucide-react'
import { MockPerson, TIER_CONFIG } from '@/lib/types'

interface PersonOrbProps {
  person: MockPerson
  daysSinceContact: number
  isUrgent: boolean
  onClick: () => void
}

export default function PersonOrb({ person, daysSinceContact, isUrgent, onClick }: PersonOrbProps) {
  const tierConfig = TIER_CONFIG[person.tier]
  const healthPercent = Math.max(0, 100 - (daysSinceContact / person.frequencyDays) * 100)

  return (
    <motion.button
      onClick={onClick}
      className={`relative group ${isUrgent ? 'urgent-glow' : ''}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full overflow-hidden border-2"
        style={{
          borderColor: isUrgent ? '#ef4444' : tierConfig.color,
          boxShadow: isUrgent
            ? '0 0 20px rgba(239, 68, 68, 0.5)'
            : `0 0 15px ${tierConfig.color}40`,
        }}
      >
        <img
          src={person.avatar}
          alt={person.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Urgent indicator */}
      {isUrgent && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <AlertCircle size={12} className="text-white" />
        </motion.div>
      )}

      {/* Hover tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
        <div className="glass rounded-lg px-3 py-2 whitespace-nowrap">
          <p className="text-sm font-medium text-white">{person.name}</p>
          <p className="text-xs text-white/60">
            {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
          </p>
          {isUrgent && (
            <p className="text-xs text-red-400 mt-1">
              {daysSinceContact - person.frequencyDays} days overdue
            </p>
          )}
        </div>
      </div>

      {/* Health ring */}
      <svg
        className="absolute inset-0 w-12 h-12 -rotate-90"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={
            healthPercent > 50
              ? '#22c55e'
              : healthPercent > 20
              ? '#eab308'
              : '#ef4444'
          }
          strokeWidth="2"
          strokeDasharray={`${(healthPercent / 100) * 138} 138`}
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  )
}
