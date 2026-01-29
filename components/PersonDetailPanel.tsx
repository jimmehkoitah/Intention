'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  Youtube,
  Github,
  Twitch,
  MessageCircle,
  Activity,
} from 'lucide-react'
import { MockPerson, TIER_CONFIG, Platform } from '@/lib/types'

interface PersonDetailPanelProps {
  person: MockPerson | null
  onClose: () => void
  onLogContact: (personId: string, method: string) => void
}

const platformIcons = {
  youtube: Youtube,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  strava: Activity,
}

export default function PersonDetailPanel({
  person,
  onClose,
  onLogContact,
}: PersonDetailPanelProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (!person) return null

  const tierConfig = TIER_CONFIG[person.tier]
  const daysSince = person.lastContactAt
    ? Math.floor((Date.now() - person.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isOverdue = daysSince !== null && daysSince >= person.frequencyDays
  const daysOverdue = daysSince !== null ? daysSince - person.frequencyDays : 0

  const handleLogContact = () => {
    onLogContact(person.id, person.contactMethod)
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-y-0 right-0 w-full md:w-96 glass-dark z-50 flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Contact Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile section */}
          <div className="flex items-center gap-4">
            <img
              src={person.avatar}
              alt={person.name}
              className="w-20 h-20 rounded-full"
              style={{ border: `3px solid ${tierConfig.color}` }}
            />
            <div>
              <h3 className="text-xl font-semibold text-white">{person.name}</h3>
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-1"
                style={{ background: tierConfig.color + '30', color: tierConfig.color }}
              >
                {tierConfig.label}
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">Connection Health</span>
              <span
                className={`text-sm font-medium ${
                  isOverdue ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {isOverdue ? 'Needs Attention' : 'Healthy'}
              </span>
            </div>

            {/* Health bar */}
            <div className="health-bar mb-3">
              <div
                className={`health-fill ${
                  daysOverdue > person.frequencyDays
                    ? 'health-critical'
                    : isOverdue
                    ? 'health-warning'
                    : 'health-good'
                }`}
                style={{
                  width: `${Math.max(5, 100 - ((daysSince || 0) / person.frequencyDays) * 100)}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/40">Last Contact</p>
                <p className="text-white font-medium">
                  {daysSince === null
                    ? 'Never'
                    : daysSince === 0
                    ? 'Today'
                    : `${daysSince} days ago`}
                </p>
              </div>
              <div>
                <p className="text-white/40">Ideal Frequency</p>
                <p className="text-white font-medium">Every {person.frequencyDays} days</p>
              </div>
            </div>

            {isOverdue && (
              <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">
                  {daysOverdue} days overdue for {person.contactMethod.toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Contact method */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-medium text-white/60 mb-3">Preferred Contact</h4>
            <div className="flex items-center gap-3">
              {person.contactMethod.toLowerCase().includes('call') ? (
                <Phone size={20} className="text-purple-400" />
              ) : (
                <MessageSquare size={20} className="text-purple-400" />
              )}
              <span className="text-white">{person.contactMethod}</span>
            </div>
          </div>

          {/* Connected platforms */}
          {person.platforms.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-white/60 mb-3">Connected On</h4>
              <div className="flex flex-wrap gap-2">
                {person.platforms.map((platform) => {
                  const Icon = platformIcons[platform]
                  return (
                    <div
                      key={platform}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5"
                    >
                      <Icon size={14} className="text-white/60" />
                      <span className="text-sm text-white/80 capitalize">{platform}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent activity placeholder */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-medium text-white/60 mb-3">Recent Activity</h4>
            <p className="text-sm text-white/40">
              Connect platforms to see {person.name}'s recent activity here.
            </p>
          </div>
        </div>

        {/* Footer action */}
        <div className="p-4 border-t border-white/10">
          <AnimatePresence mode="wait">
            {showConfirmation ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 text-green-400"
              >
                <CheckCircle size={20} />
                <span>Contact logged!</span>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                onClick={handleLogContact}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle size={20} />
                <span>Log Contact</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
