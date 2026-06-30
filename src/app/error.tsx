'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log full error for diagnostics; never surface raw details to the user
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold font-mono text-[#6C5CE7] mb-4">500</p>
        <h2 className="text-white text-2xl font-bold font-syne mb-3">Something went wrong</h2>
        <p className="text-[#8B8FA8] text-sm mb-8">
          An unexpected error occurred on our end. Please try again.
          {error.digest && (
            <span className="block mt-2 text-xs text-[#8B8FA8]/60 font-mono">Ref: {error.digest}</span>
          )}
        </p>
        <button
          onClick={reset}
          className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
