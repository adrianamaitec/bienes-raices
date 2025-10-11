// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Si el usuario no está autenticado y trata de acceder a rutas protegidas
    if (!session) {
        if (req.nextUrl.pathname.startsWith('/client') ||
            req.nextUrl.pathname.startsWith('/architect')) {
            console.log('🚫 Acceso denegado, redirigiendo a login');
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    // Si el usuario está autenticado
    if (session) {
        console.log('✅ Usuario autenticado:', session.user.email);

        // Redirigir desde login/register si ya está autenticado
        if (req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register')) {
            console.log('🔄 Ya autenticado, redirigiendo a dashboard');
            return NextResponse.redirect(new URL('/client/dashboard', req.url))
        }

        // Verificar roles para rutas de arquitecto
        if (req.nextUrl.pathname.startsWith('/architect')) {
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (user?.role !== 'architect') {
                console.log('🚫 No es arquitecto, redirigiendo a cliente');
                return NextResponse.redirect(new URL('/client/dashboard', req.url))
            }
        }
    }

    return res
}

export const config = {
    matcher: [
        '/client/:path*',
        '/architect/:path*',
        '/login',
        '/register'
    ]
}