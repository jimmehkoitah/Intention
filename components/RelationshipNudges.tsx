'use client'

import { motion } from 'framer-motion'
import { Phone, MessageSquare, AlertCircle, ChevronRight, X, Archive, UserMinus } from 'lucide-react'
import { MockPerson, TIER_CONFIG } from '@/lib/types'

interface RelationshipNudgesProps {
  people: MockPerson[]
  onContact: (person: MockPerson) => void
  onDismiss: (personId: string) => void
  onArchive: (personId: string) => void
}

export default function RelationshipNudges({
  people,
  onContact,
  onDismiss,
  onArchive,
}: RelationshipNudgesProps) {
  // Calculate urgency for each person
  const getNudgeInfo = (person: MockPerson) => {
    const daysSince = person.lastContactAt
      ? Math.floor((Date.now() - person.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999

    const daysOverdue = daysSince - person.frequencyDays
    const isOverdue = daysOverdue > 0
    const urgency: 'low' | 'medium' | 'high' =
      daysOverdue > person.frequencyDays ? 'high' : daysOverdue > 0 ? 'medium' : 'low'

    // Generate suggested action
    let suggestedAction = ''
    if (person.contactMethod.toLowerCase().includes('call')) {
      suggestedAction = 'Give them a quick call'
    } else if (person.contactMethod.toLowerCase().includes('text')) {
      suggestedAction = 'Send a quick text'
    } else {
      suggestedAction = 'Reach out and say hi'
    }

    return { daysSince, daysOverdue, isOverdue, urgency, suggestedAction }
  }

  // Filter and sort by urgency
  const nudges = people
    .map(person => ({ person, ...getNudgeInfo(person) }))
    .filter(n => n.daysSince >= n.person.frequencyDays * 0.7) // Show when 70% through frequency
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 3) // Show top 3

  if (nudges.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/60">Stay Connected</h2>
        <span className="text-xs text-white/40">{nudges.length} need attention</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nudges.map(({ person, daysSince, daysOverdue, isOverdue, urgency, suggestedAction }, i) => (
          <motion.div
            key={person.id}
            className={`glass rounded-xl p-4 ${urgency === 'high' ? 'urgent-glow' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-12 h-12 rounded-full"
                    style={{
                      border: `2px solid ${
                        urgency === 'high'
                          ? '#ef4444'
                          : urgency === 'medium'
                          ? '#eab308'
                          : TIER_CONFIG[person.tier].color
                      }`,
                    }}
                  />
                  {urgency === 'high' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{person.name}</p>
                  <p className="text-xs text-white/40">{person.tier.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(person.id)}
                className="p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Status */}
            <div className="mb-3">
              <p className="text-sm text-white/80">
                {isOverdue ? (
                  <>
                    <span className="text-red-400 font-medium">{daysOverdue} days</span> overdue
                  </>
                ) : (
                  <>Last contact: {daysSince} days ago</>
                )}
              </p>
              <p className="text-xs text-white/50 mt-1">{suggestedAction}</p>
            </div>

            {/* Health bar */}
            <div className="health-bar mb-4">
              <div
                className={`health-fill ${
                  urgency === 'high'
                    ? 'health-critical'
                    : urgency === 'medium'
                    ? 'health-warning'
                    : 'health-good'
                }`}
                style={{
                  width: `${Math.max(5, 100 - (daysSince / person.frequencyDays) * 100)}%`,
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => onContact(person)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                {person.contactMethod.toLowerCase().includes('call') ? (
                  <Phone size={16} />
                ) : (
                  <MessageSquare size={16} />
                )}
                <span className="text-sm">{person.contactMethod}</span>
              </motion.button>

              {daysOverdue > person.frequencyDays * 2 && (
                <motion.button
                  onClick={() => onArchive(person.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
                  whileTap={{ scale: 0.97 }}
                  title="Archive this contact"
                >
                  <Archive size={16} />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
