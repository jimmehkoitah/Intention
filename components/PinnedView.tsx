'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MessageSquare, Heart, Share2 } from 'lucide-react'
import { MockSignal, PLATFORMS } from '@/lib/types'

interface PinnedViewProps {
  signal: MockSignal | null
  onClose: () => void
}

export default function PinnedView({ signal, onClose }: PinnedViewProps) {
  if (!signal) return null

  const config = PLATFORMS[signal.platform]

  // Generate embed URL for YouTube
  const getEmbedUrl = () => {
    if (signal.platform === 'youtube' && signal.url) {
      const videoId = signal.url.split('v=')[1]?.split('&')[0]
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`
      }
    }
    if (signal.platform === 'twitch' && signal.url) {
      const channel = signal.url.split('twitch.tv/')[1]
      if (channel) {
        return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`
      }
    }
    return null
  }

  const embedUrl = getEmbedUrl()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 glass-dark z-50 flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: config.color }}
            />
            <span className="text-sm font-medium text-white">{signal.contactName}</span>
            {signal.isLive && <span className="live-badge">LIVE</span>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video embed or thumbnail */}
          {embedUrl ? (
            <div className="aspect-video bg-black">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : signal.thumbnailUrl ? (
            <div className="aspect-video bg-black/40">
              <img
                src={signal.thumbnailUrl}
                alt={signal.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* Details */}
          <div className="p-4 space-y-4">
            <h1 className="text-lg font-semibold text-white">{signal.title}</h1>

            {signal.description && (
              <p className="text-sm text-white/60">{signal.description}</p>
            )}

            {/* Contact info */}
            <div className="flex items-center gap-3 py-3 border-y border-white/10">
              <img
                src={signal.contactAvatar}
                alt={signal.contactName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{signal.contactName}</p>
                <p className="text-xs text-white/40">
                  {signal.isLive ? 'Streaming now' : `Posted ${new Date(signal.publishedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Heart size={18} className="text-white/60" />
                <span className="text-sm text-white/80">Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <MessageSquare size={18} className="text-white/60" />
                <span className="text-sm text-white/80">Comment</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Share2 size={18} className="text-white/60" />
                <span className="text-sm text-white/80">Share</span>
              </button>
            </div>

            {/* Open in app */}
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            >
              <ExternalLink size={16} className="text-white/60" />
              <span className="text-sm text-white/80">Open in {config.name}</span>
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
