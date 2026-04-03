import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'Registration is currently disabled. Contact admin for access.' },
    { status: 403 }
  )
}

