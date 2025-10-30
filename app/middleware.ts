// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crear cliente Supabase del lado del servidor (middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Obtener la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // 🚫 Si intenta acceder a rutas protegidas sin estar logueado → redirigir a /login
  const isProtectedRoute = pathname.startsWith('/client') || pathname.startsWith('/architect');
  if (!session && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Si está logueado, continuar normalmente
  return res;
}

export const config = {
  matcher: ['/client/:path*', '/architect/:path*'], // protege estas rutas
};
