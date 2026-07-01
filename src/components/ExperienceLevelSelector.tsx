"use client";

import { EXPERIENCE_LEVELS, type ExperienceKey } from '@/lib/experience-levels'
import { cn } from '@/lib/utils'

interface Props {
  value: ExperienceKey
  onChange: (experience: ExperienceKey) => void
}

export function ExperienceLevelSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
        Your experience level
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(EXPERIENCE_LEVELS) as [ExperienceKey, (typeof EXPERIENCE_LEVELS)[ExperienceKey]][]).map(
          ([key, config]) => {
            const selected = value === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={cn(
                  'flex flex-col gap-0.5 px-4 py-3 rounded-xl border-2 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-background text-text-secondary hover:border-primary/50 hover:text-white'
                )}
              >
                <span className="font-semibold text-sm">{config.label}</span>
                <span className="text-xs text-text-secondary">{config.description}</span>
              </button>
            )
          }
        )}
      </div>
    </div>
  )
}
