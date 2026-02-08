'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Sparkles } from 'lucide-react'

interface AISearchProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => Promise<string>
}

export default function AISearch({ isOpen, onClose, onSearch }: AISearchProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard shortcut to open (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // This would typically call a parent handler to open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await onSearch(query)
      setResult(response)
    } catch (error) {
      setResult('Sorry, something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setQuery('')
    setResult(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Search modal */}
          <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <div className="glass-dark rounded-2xl overflow-hidden shadow-2xl">
              {/* Search input */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center px-4 border-b border-white/10">
                  <Sparkles size={20} className="text-purple-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything about your network..."
                    className="flex-1 px-4 py-4 bg-transparent text-white placeholder:text-white/40 outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-2 rounded-full hover:bg-white/10 text-white/40"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions or results */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="text-purple-400 animate-spin" />
                    <span className="ml-3 text-white/60">Searching your network...</span>
                  </div>
                ) : result ? (
                  <div className="p-4">
                    <p className="text-sm text-white/80 whitespace-pre-wrap">{result}</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                      Try asking
                    </p>
                    {[
                      'What did my friends post this week?',
                      'Who is live streaming right now?',
                      'Show me recent GitHub activity',
                      'Who should I reach out to?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion)
                          inputRef.current?.focus()
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/60 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Enter</kbd>{' '}
                    to search
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Esc</kbd>{' '}
                    to close
                  </span>
                </div>
                <span className="text-xs text-purple-400/60">Powered by AI</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
