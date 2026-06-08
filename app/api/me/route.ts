// app/api/me/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user })
}
