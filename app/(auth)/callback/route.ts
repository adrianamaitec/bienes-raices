import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const supabase = createClient() // SSR client que maneja cookies

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) console.error('Error intercambiando el código:', error)
  }

  return NextResponse.redirect(`${url.origin}/set-password`)
}
