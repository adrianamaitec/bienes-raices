// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./lib/supabase/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  // Si ocurre error o no hay user, entonces no autenticado
  const pathname = req.nextUrl.pathname;

  if (!user) {
    // No autenticado
    if (pathname.startsWith("/client") || pathname.startsWith("/architect")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // Hay usuario, veamos rol
  const { data: userRow, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userRow?.role;

  // Si ruta /architect y usuario no es architect → redirige cliente
  if (pathname.startsWith("/architect") && role !== "architect") {
    return NextResponse.redirect(new URL("/client/dashboard", req.url));
  }

  // Si ruta /client y usuario no es client → redirige architect
  if (pathname.startsWith("/client") && role !== "client") {
    return NextResponse.redirect(new URL("/architect/dashboard", req.url));
  }

  // Si está autenticado e intenta ir a login/register → redirigir según rol
  if (pathname === "/login" || pathname === "/register") {
    if (role === "architect") {
      return NextResponse.redirect(new URL("/architect/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/client/:path*", "/architect/:path*", "/login", "/register"],
};
