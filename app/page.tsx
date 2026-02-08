'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Settings, Bell, User } from 'lucide-react'
import Constellation from '@/components/Constellation'
import SignalFeed from '@/components/SignalFeed'
import RelationshipNudges from '@/components/RelationshipNudges'
import PinnedView from '@/components/PinnedView'
import AISearch from '@/components/AISearch'
import PersonDetailPanel from '@/components/PersonDetailPanel'
import { Platform, MockSignal, MockPerson, MOCK_PEOPLE, MOCK_SIGNALS } from '@/lib/types'

export default function Home() {
  // State
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>(['youtube', 'github', 'twitch'])
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([])
  const [pinnedSignal, setPinnedSignal] = useState<MockSignal | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<MockPerson | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [people, setPeople] = useState<MockPerson[]>(MOCK_PEOPLE)

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handlers
  const handlePlatformClick = (platform: Platform) => {
    setActivePlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleConnectPlatform = (platform: Platform) => {
    // In production, this would redirect to OAuth flow
    window.location.href = `/api/auth/${platform}`
  }

  const handlePinSignal = (signal: MockSignal) => {
    setPinnedSignal(prev => (prev?.id === signal.id ? null : signal))
  }

  const handlePersonClick = (personId: string) => {
    const person = people.find(p => p.id === personId)
    if (person) setSelectedPerson(person)
  }

  const handleLogContact = (personId: string, method: string) => {
    setPeople(prev =>
      prev.map(p =>
        p.id === personId
          ? { ...p, lastContactAt: new Date() }
          : p
      )
    )
    // In production, this would also save to the database
  }

  const handleSearch = async (query: string): Promise<string> => {
    // In production, this would call the AI search API
    const response = await fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, signals: MOCK_SIGNALS }),
    })

    if (!response.ok) {
      // For demo, return a mock response
      const liveCount = MOCK_SIGNALS.filter(s => s.isLive).length
      return `Based on your network activity:\n\n• ${liveCount} people are live streaming right now\n• Your friends have posted ${MOCK_SIGNALS.length} updates recently\n• You should reach out to ${people.filter(p => {
        const daysSince = p.lastContactAt ? Math.floor((Date.now() - p.lastContactAt.getTime()) / (1000 * 60 * 60 * 24)) : 999
        return daysSince >= p.frequencyDays
      }).length} contacts who need attention`
    }

    const data = await response.json()
    return data.result
  }

  return (
    <div className="min-h-screen constellation-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-dark">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <span className="text-white font-semibold">UpKeep</span>
          </div>

          {/* Search bar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <Search size={16} className="text-white/40" />
            <span className="text-sm text-white/40">Search your network...</span>
            <kbd className="hidden md:inline px-2 py-0.5 rounded bg-white/10 text-xs text-white/30">
              ⌘K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-white/60" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Settings size={20} className="text-white/60" />
            </button>
            <a
              href="/integrations"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <User size={20} className="text-white/60" />
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`pt-20 pb-8 px-4 transition-all duration-300 ${pinnedSignal ? 'mr-[40%]' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Constellation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            <Constellation
              connectedPlatforms={connectedPlatforms}
              activePlatforms={activePlatforms}
              onPlatformClick={handlePlatformClick}
              onPersonClick={handlePersonClick}
              onConnectPlatform={handleConnectPlatform}
            />
          </motion.section>

          {/* Platform filter pills */}
          {activePlatforms.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/40">Showing:</span>
              {activePlatforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => handlePlatformClick(platform)}
                  className="px-3 py-1 rounded-full glass text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  {platform} ×
                </button>
              ))}
              <button
                onClick={() => setActivePlatforms([])}
                className="px-3 py-1 rounded-full text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Relationship Nudges */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <RelationshipNudges
              people={people}
              onContact={(person) => setSelectedPerson(person)}
              onDismiss={(id) => console.log('Dismiss', id)}
              onArchive={(id) => console.log('Archive', id)}
            />
          </motion.section>

          {/* Signal Feed */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SignalFeed
              activePlatforms={activePlatforms}
              onPinSignal={handlePinSignal}
              pinnedSignalId={pinnedSignal?.id}
            />
          </motion.section>
        </div>
      </main>

      {/* Pinned content panel */}
      {pinnedSignal && (
        <PinnedView signal={pinnedSignal} onClose={() => setPinnedSignal(null)} />
      )}

      {/* Person detail panel */}
      {selectedPerson && (
        <PersonDetailPanel
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onLogContact={handleLogContact}
        />
      )}

      {/* AI Search modal */}
      <AISearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  )
}
