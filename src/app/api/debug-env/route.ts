import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testSecret = searchParams.get('s')
  const stored = process.env.JOB_AGENT_SECRET ?? ''

  return NextResponse.json({
    has_job_agent_secret: !!stored,
    secret_matches: testSecret !== null ? testSecret === stored : null,
    auth_header_received: req.headers.get('authorization'),
    auth_header_matches: req.headers.get('authorization') === `Bearer ${stored}`,
  })
}
