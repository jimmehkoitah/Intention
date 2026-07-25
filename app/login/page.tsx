'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check, AlertCircle } from 'lucide-react'
import Aurora from '@/components/mobile/Aurora'
import { createClient, isConfigured } from '@/lib/supabase/client'

function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(params.get('error'))

  const configured = isConfigured()

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setState('sending')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (error) throw error
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the link')
      setState('idle')
    }
  }

  const withGoogle = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in is unavailable')
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col text-white isolate" style={{ background: '#07060f' }}>
      <Aurora />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 max-w-md w-full mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center text-xl font-bold"
            style={{
              background:
                'radial-gradient(circle at 32% 26%, rgba(255,255,255,.6), transparent 46%),' +
                'linear-gradient(135deg, #f0abfc, #8b5cf6 55%, #22d3ee)',
              boxShadow: '0 6px 20px rgba(139,92,246,.6)',
            }}
          >
            I
          </div>
          <span
            className="text-[30px] font-bold tracking-[-0.02em] bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(92deg, #e9d5ff, #a78bfa 38%, #22d3ee)' }}
          >
            Intention
          </span>
        </div>

        <h1 className="mt-7 text-[22px] font-semibold leading-snug">
          Stay close to the people who matter.
        </h1>
        <p className="mt-1.5 text-[14px] text-white/50">
          Sign in to connect your platforms and keep your own data.
        </p>

        {!configured && (
          <div className="mt-6 p-4 rounded-2xl glass holo flex gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-300" />
            <p className="text-[13px] text-white/70">
              Supabase isn&rsquo;t configured, so sign-in is unavailable. Set{' '}
              <code className="text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart.
              The demo still works at <a href="/" className="underline">/</a>.
            </p>
          </div>
        )}

        {state === 'sent' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 p-5 rounded-2xl glass holo text-center"
          >
            <div
              className="w-12 h-12 rounded-full grid place-items-center mx-auto"
              style={{ background: 'linear-gradient(92deg,#2ee6a8,#22d3ee)', color: '#04231b' }}
            >
              <Check size={22} strokeWidth={3} />
            </div>
            <p className="mt-3 text-[15px] font-semibold">Check your email</p>
            <p className="mt-1 text-[13px] text-white/55">
              We sent a sign-in link to <span className="text-white/80">{email}</span>. Open it on
              this device.
            </p>
            <button
              onClick={() => { setState('idle'); setEmail('') }}
              className="mt-4 text-[13px] text-white/45 underline"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <>
            <form onSubmit={sendLink} className="mt-7 space-y-2.5">
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!configured}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-[15px] border border-white/20 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-white/45 disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.05))',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.26)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!configured || state === 'sending' || !email}
                className="w-full flex items-center justify-center gap-2 py-[15px] rounded-[15px] text-[15px] font-bold disabled:opacity-45"
                style={{
                  background:
                    'radial-gradient(120% 160% at 22% 0%, rgba(255,255,255,.34), transparent 62%),' +
                    'linear-gradient(92deg, #8b5cf6, #6366f1 46%, #22d3ee)',
                  boxShadow: '0 12px 32px rgba(139,92,246,.5), inset 0 1px 0 rgba(255,255,255,.45)',
                }}
              >
                {state === 'sending' ? 'Sending…' : <>Email me a link <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[12px] text-white/30">
              <span className="h-px flex-1 bg-white/15" />or<span className="h-px flex-1 bg-white/15" />
            </div>

            <button
              onClick={withGoogle}
              disabled={!configured}
              className="sheen relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[15px] border border-white/20 text-[14px] font-semibold disabled:opacity-45"
              style={{
                background: 'linear-gradient(150deg, rgba(255,255,255,.16), rgba(255,255,255,.05))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
                <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"/>
                <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z"/>
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/>
              </svg>
              Continue with Google
            </button>

            <p className="mt-3 text-[11px] text-white/30 text-center">
              Google works once the provider is enabled in Supabase Auth. Email links need no setup.
            </p>
          </>
        )}

        {error && (
          <div className="mt-5 p-3.5 rounded-2xl flex gap-2.5 border border-red-400/40 bg-red-500/10">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-400" />
            <p className="text-[13px] text-red-200">{error}</p>
          </div>
        )}

        <a href="/" className="mt-7 text-center text-[13px] text-white/35 hover:text-white/60">
          Skip — explore the demo
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0" style={{ background: '#07060f' }} />}>
      <LoginForm />
    </Suspense>
  )
}
