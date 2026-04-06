import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Called by Vercel Cron every 14 minutes to prevent the Render backend
// from going to sleep (Render free tier sleeps after 15 min of inactivity).
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      next: { revalidate: 0 }, // never cache — always ping live
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
