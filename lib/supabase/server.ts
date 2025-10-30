// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lectura simple por nombre
        get: async (name: string) => (await cookieStore).get(name)?.value,
        // Escritura simple por nombre (Next RequestCookies.set acepta { name, value, options })
        set: async (name: string, value: string, options?: any) =>
          (await cookieStore).set({ name, value, ...options }),
        delete: async (name: string) => (await cookieStore).delete(name),
      } as any,
    }
  );
}
