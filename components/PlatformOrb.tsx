'use client'

import { motion } from 'framer-motion'
import { Youtube, Github, Twitch, MessageCircle, Activity, Plus } from 'lucide-react'
import { Platform, PLATFORMS } from '@/lib/types'

interface PlatformOrbProps {
  platform: Platform
  connected: boolean
  active: boolean
  hasLive?: boolean
  signalCount?: number
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

const iconMap = {
  youtube: Youtube,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  strava: Activity,
}

const sizeMap = {
  sm: { orb: 48, icon: 20 },
  md: { orb: 64, icon: 28 },
  lg: { orb: 80, icon: 36 },
}

export default function PlatformOrb({
  platform,
  connected,
  active,
  hasLive = false,
  signalCount = 0,
  onClick,
  size = 'md',
  style,
}: PlatformOrbProps) {
  const config = PLATFORMS[platform]
  const Icon = iconMap[platform]
  const dimensions = sizeMap[size]

  return (
    <motion.button
      onClick={onClick}
      className={`relative orb flex items-center justify-center ${
        connected ? 'cursor-pointer' : 'cursor-pointer opacity-60'
      }`}
      style={{
        width: dimensions.orb,
        height: dimensions.orb,
        background: connected
          ? `radial-gradient(circle at 30% 30%, ${config.color}40, ${config.color}10)`
          : 'rgba(255, 255, 255, 0.05)',
        border: `2px solid ${connected ? config.color + '60' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: active
          ? `0 0 30px ${config.color}50, 0 0 60px ${config.color}20`
          : connected
          ? `0 0 20px ${config.color}30`
          : 'none',
        ...style,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={
        active
          ? {
              boxShadow: [
                `0 0 30px ${config.color}50, 0 0 60px ${config.color}20`,
                `0 0 40px ${config.color}60, 0 0 80px ${config.color}30`,
                `0 0 30px ${config.color}50, 0 0 60px ${config.color}20`,
              ],
            }
          : {}
      }
      transition={{ duration: 2, repeat: active ? Infinity : 0 }}
    >
      {connected ? (
        <Icon
          size={dimensions.icon}
          style={{ color: config.color }}
          strokeWidth={1.5}
        />
      ) : (
        <Plus
          size={dimensions.icon}
          className="text-white/40"
          strokeWidth={1.5}
        />
      )}

      {/* Live indicator */}
      {hasLive && (
        <motion.div
          className="absolute -top-1 -right-1 live-badge"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          LIVE
        </motion.div>
      )}

      {/* Signal count badge */}
      {signalCount > 0 && !hasLive && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: config.color, color: platform === 'github' ? '#000' : '#fff' }}
        >
          {signalCount > 9 ? '9+' : signalCount}
        </div>
      )}

      {/* Platform name tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-xs text-white/60 whitespace-nowrap">
          {config.name}
          {!connected && ' (Connect)'}
        </span>
      </div>
    </motion.button>
  )
}
