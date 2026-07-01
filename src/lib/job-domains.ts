export const JOB_DOMAINS = {
  tech: {
    label: 'Tech / Software',
    icon: '',
    naukriKeyword: 'software engineer',
    searchKeyword: 'software developer',
  },
  design: {
    label: 'Design / Creative',
    icon: '',
    naukriKeyword: 'graphic designer',
    searchKeyword: 'UI UX designer',
  },
} as const

export type DomainKey = keyof typeof JOB_DOMAINS
