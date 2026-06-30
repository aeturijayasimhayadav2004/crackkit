"use client";

import { useState } from 'react'
import { Zap, CheckCircle2, Loader2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { JobAgentDomainSelector } from '@/components/JobAgentDomainSelector'
import { type DomainKey } from '@/lib/job-domains'

interface Props {
  initialDomains: DomainKey[]
  onComplete: () => void
}

export function JobAgentSetupCard({ initialDomains, onComplete }: Props) {
  const [domains, setDomains] = useState<DomainKey[]>(initialDomains)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const activate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-agent/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains }),
      })
      const data = await res.json() as { error?: string }
      if (res.ok) {
        setDone(true)
        localStorage.removeItem('crackkit_agent_domains')
        onComplete()
      } else {
        toast.error(data.error ?? 'Setup failed. Try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 flex flex-col items-center gap-4 p-8 bg-success/10 border border-success/20 rounded-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-success" />
        <h3 className="text-xl font-bold text-white font-syne">Job Alert Activated!</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          You&apos;ll receive your first job digest tomorrow morning at 8AM IST. 10 fresh Indian jobs, straight to your inbox.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-surface border border-primary/25 rounded-2xl shadow-[0_0_30px_rgba(108,92,231,0.1)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Mail className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-bold text-white text-lg font-syne">Activate Job Alerts</h2>
      </div>
      <p className="text-text-secondary text-sm mb-6 leading-relaxed">
        Confirm your domains below. We&apos;ll send 10 fresh Indian jobs to your inbox every morning.
      </p>

      <JobAgentDomainSelector value={domains} onChange={setDomains} />

      <button
        onClick={activate}
        disabled={loading || domains.length === 0}
        className="mt-6 w-full py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(108,92,231,0.35)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Activating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-white" />
            Start Daily Job Alerts
          </>
        )}
      </button>
    </div>
  )
}
