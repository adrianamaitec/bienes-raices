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

        console.log('📨 Datos recibidos:', { email, firstName, lastName });

        if (!email || !firstName || !lastName) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        // ✅ Configuración mejorada del link de invitación
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: 'architect'
                },
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/callback`
            }
        });

        if (inviteError) {
            console.error('❌ Error generando invitación:', inviteError);
            throw inviteError;
        }

        const inviteLink = inviteData.properties?.action_link;
        const userId = inviteData.user?.id;

        console.log('✅ Link de invitación generado:', inviteLink);
        console.log('✅ User ID:', userId);

        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }

        // Crear perfil en public.users
        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                first_name: firstName,
                last_name: lastName,
                role: 'architect',
                is_active: false,
            });

        if (insertError) {
            console.error('❌ Error creando perfil:', insertError);

            // Si falla el perfil, eliminar el usuario de auth
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw insertError;
        }

        console.log('✅ Perfil creado en public.users');

        return NextResponse.json({
            message: 'Usuario invitado correctamente',
            inviteLink: inviteLink || 'No se pudo generar el link',
            userId,
            emailSent: false // Indicar que no se envió email
        });

    } catch (err: any) {
        console.error('💥 Error completo:', err);
        return NextResponse.json({
            error: err.message || 'Error desconocido'
        }, { status: 500 });
    }
}