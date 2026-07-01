export const EXPERIENCE_LEVELS = {
  fresher: {
    label: 'Fresher / Entry Level',
    description: '0–1 years',
    icon: '🌱',
    linkedInFilter: '2',
    naukriMin: 0,
    naukriMax: 1,
  },
  junior: {
    label: 'Junior',
    description: '1–3 years',
    icon: '🚀',
    linkedInFilter: '2,3',
    naukriMin: 1,
    naukriMax: 3,
  },
  mid: {
    label: 'Mid Level',
    description: '3–5 years',
    icon: '⚡',
    linkedInFilter: '3,4',
    naukriMin: 3,
    naukriMax: 5,
  },
  senior: {
    label: 'Senior / Lead',
    description: '5+ years',
    icon: '👑',
    linkedInFilter: '4',
    naukriMin: 5,
    naukriMax: 15,
  },
} as const

export type ExperienceKey = keyof typeof EXPERIENCE_LEVELS
