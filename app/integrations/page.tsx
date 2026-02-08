'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Youtube,
  Github,
  Twitch,
  MessageCircle,
  Activity,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { Platform, PLATFORMS } from '@/lib/types'

interface ConnectionStatus {
  platform: Platform
  connected: boolean
  username?: string
  connectedAt?: string
}

const iconMap = {
  youtube: Youtube,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  strava: Activity,
}

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check URL params for success/error messages
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success) {
      setSuccessMessage(`Successfully connected ${success}!`)
      // Update connections state
      setConnections(prev => [
        ...prev.filter(c => c.platform !== success),
        { platform: success as Platform, connected: true, connectedAt: new Date().toISOString() },
      ])
    }

    if (error) {
      setErrorMessage(`Failed to connect: ${error}`)
    }

    // Check for existing connections (from cookies in real app)
    // For demo, we'll just show them as disconnected
    const platforms: Platform[] = ['youtube', 'github', 'twitch', 'discord', 'strava']
    setConnections(platforms.map(p => ({
      platform: p,
      connected: success === p,
    })))
  }, [])

  const handleConnect = (platform: Platform) => {
    // Redirect to OAuth flow
    window.location.href = `/api/auth/${platform}`
  }

  const handleDisconnect = async (platform: Platform) => {
    // In production, this would revoke tokens and clear from database
    setConnections(prev =>
      prev.map(c => (c.platform === platform ? { ...c, connected: false } : c))
    )
  }

  return (
    <div className="min-h-screen constellation-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-dark">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Integrations</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success/Error messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3"
            >
              <Check size={20} className="text-green-400" />
              <span className="text-green-300">{successMessage}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-300">{errorMessage}</span>
            </motion.div>
          )}

          {/* Description */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect Your Platforms
            </h2>
            <p className="text-white/60">
              Link your accounts to see activity from your network in one place.
              We only request read access to show you content from people you follow.
            </p>
          </div>

          {/* Platform cards */}
          <div className="grid gap-4">
            {connections.map((connection, i) => {
              const config = PLATFORMS[connection.platform]
              const Icon = iconMap[connection.platform]
              const isAvailable = ['youtube', 'github', 'twitch'].includes(connection.platform)

              return (
                <motion.div
                  key={connection.platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass rounded-xl p-4 ${
                    !isAvailable ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: config.color + '20' }}
                      >
                        <Icon
                          size={24}
                          style={{ color: config.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{config.name}</h3>
                        <p className="text-sm text-white/50">{config.description}</p>
                        {connection.connected && connection.username && (
                          <p className="text-xs text-white/40 mt-1">
                            Connected as {connection.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {connection.connected ? (
                        <>
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                            <Check size={14} />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect(connection.platform)}
                            className="px-3 py-1 rounded-full text-sm text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : isAvailable ? (
                        <button
                          onClick={() => handleConnect(connection.platform)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Connect
                          <ExternalLink size={14} />
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm text-white/30 bg-white/5">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Privacy note */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-1">Privacy Note</h3>
            <p className="text-xs text-white/50">
              UpKeep only requests read-only access to your accounts. We never post,
              modify, or delete anything on your behalf. Your data is stored securely
              and only used to show you relevant content from your network.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
