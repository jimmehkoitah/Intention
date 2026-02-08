'use client'

import { motion } from 'framer-motion'
import { Youtube, Github, Twitch, MessageCircle, Activity, Bookmark, ExternalLink } from 'lucide-react'
import { Platform, PLATFORMS, MockSignal } from '@/lib/types'

interface SignalCardProps {
  signal: MockSignal
  onPin: () => void
  isPinned?: boolean
}

const iconMap = {
  youtube: Youtube,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  strava: Activity,
}

export default function SignalCard({ signal, onPin, isPinned = false }: SignalCardProps) {
  const config = PLATFORMS[signal.platform]
  const Icon = iconMap[signal.platform]

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <motion.div
      className="signal-card glass rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Thumbnail */}
      {signal.thumbnailUrl && (
        <div className="relative aspect-video bg-black/40">
          <img
            src={signal.thumbnailUrl}
            alt={signal.title}
            className="w-full h-full object-cover"
          />
          {signal.isLive && (
            <div className="absolute top-2 left-2 live-badge">LIVE</div>
          )}
          <div
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: config.color + '80' }}
          >
            <Icon size={16} style={{ color: signal.platform === 'github' ? '#000' : '#fff' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header without thumbnail */}
        {!signal.thumbnailUrl && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: config.color + '30' }}
            >
              <Icon size={14} style={{ color: config.color }} />
            </div>
            <span className="text-xs text-white/40 uppercase tracking-wider">
              {signal.type}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
          {signal.title}
        </h3>

        {/* Description */}
        {signal.description && (
          <p className="text-xs text-white/50 line-clamp-2 mb-3">
            {signal.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={signal.contactAvatar}
              alt={signal.contactName}
              className="w-6 h-6 rounded-full"
            />
            <div>
              <p className="text-xs font-medium text-white/80">{signal.contactName}</p>
              <p className="text-xs text-white/40">{timeAgo(signal.publishedAt)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onPin}
              className={`p-2 rounded-full transition-colors ${
                isPinned ? 'bg-purple-500/30 text-purple-400' : 'hover:bg-white/10 text-white/40'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark size={16} fill={isPinned ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 text-white/40 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink size={16} />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
