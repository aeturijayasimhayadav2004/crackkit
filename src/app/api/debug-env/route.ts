import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    has_job_agent_secret: !!process.env.JOB_AGENT_SECRET,
    has_cron_secret: !!process.env.CRON_SECRET,
    has_resend_key: !!process.env.RESEND_API_KEY,
    node_env: process.env.NODE_ENV,
  })
}
