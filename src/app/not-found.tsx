import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold font-mono text-[#6C5CE7] mb-2">404</p>
        <h1 className="text-white text-3xl font-bold font-syne mb-3">Page not found</h1>
        <p className="text-[#8B8FA8] text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
