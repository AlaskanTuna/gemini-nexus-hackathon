import { NextResponse } from 'next/server'

import { sendMessage } from '@/lib/a2a-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const response = await sendMessage(message)
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected chat proxy failure.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
