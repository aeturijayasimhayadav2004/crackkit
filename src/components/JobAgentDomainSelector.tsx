"use client";

import { JOB_DOMAINS, type DomainKey } from '@/lib/job-domains'
import { cn } from '@/lib/utils'

interface Props {
  value: DomainKey[]
  onChange: (domains: DomainKey[]) => void
}

export function JobAgentDomainSelector({ value, onChange }: Props) {
  const toggle = (domain: DomainKey) => {
    if (value.includes(domain)) {
      // Keep at least one selected
      if (value.length > 1) onChange(value.filter((d) => d !== domain))
    } else {
      onChange([...value, domain])
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
        Select your job domains
      </p>
      <div className="flex flex-col gap-2">
        {(Object.entries(JOB_DOMAINS) as [DomainKey, (typeof JOB_DOMAINS)[DomainKey]][]).map(
          ([key, config]) => {
            const selected = value.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-background text-text-secondary hover:border-primary/50 hover:text-white'
                )}
              >
                <span className="font-semibold text-sm">{config.label}</span>
                {selected && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            )
          }
        )}
      </div>
      <p className="text-xs text-text-secondary mt-2">
        At least one domain required · max 2
      </p>
    </div>
  )
}
