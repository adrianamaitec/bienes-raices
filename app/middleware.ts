import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        if (req.nextUrl.pathname.startsWith('/client') || req.nextUrl.pathname.startsWith('/architect')) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } else {
        // Verificar si ya está autenticado
        if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/auth/register')) {
            return NextResponse.redirect(new URL('/client/dashboard', req.url));
        }

        // Verificar rol desde la tabla users
        if (req.nextUrl.pathname.startsWith('/architect')) {
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (user?.role !== 'architect') {
                return NextResponse.redirect(new URL('/client/dashboard', req.url));
            }
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/client/:path*',
        '/architect/:path*',
        '/login',
        '/register',
    ],
};
