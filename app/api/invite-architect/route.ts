// app/api/invite-architect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // 1️⃣ Crear invitación
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: { first_name: firstName, last_name: lastName, role: 'architect' },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/set-password`
      }
    });

    if (inviteError) throw inviteError;

    const userId = inviteData.user?.id;
    if (!userId) throw new Error('No se pudo obtener el ID del usuario');

    // 2️⃣ Crear perfil en users
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, first_name: firstName, last_name: lastName, role: 'architect', is_active: false });

    if (insertError) {
      // Si falla el perfil, eliminar usuario
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw insertError;
    }

    // 3️⃣ Construir link con userId incluido
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/set-password?userId=${userId}`;

    return NextResponse.json({
      message: 'Usuario invitado correctamente',
      inviteLink,
      userId,
      emailSent: false
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error desconocido' }, { status: 500 });
  }
}
