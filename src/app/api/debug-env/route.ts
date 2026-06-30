import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testSecret = searchParams.get('s')

  const stored = process.env.JOB_AGENT_SECRET ?? ''
  const matches = testSecret !== null ? testSecret === stored : null

  return NextResponse.json({
    has_job_agent_secret: !!stored,
    matches: matches,
  })
}
