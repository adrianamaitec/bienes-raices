'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ChangeEmailPage() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState(''); // Para confirmar identidad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = supabaseBrowser();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setNewEmail(user.email??'');
    };
    getUser();
  }, []);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!newEmail.includes('@')) {
        throw new Error('Ingresa un email válido');
      }

      // Actualizar email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) throw updateError;

      alert('✅ Email actualizado correctamente');
      router.push('/architect/profile'); // redirigir al perfil
    } catch (err: any) {
      console.error('Error cambiando email:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Cambiar Email</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Cambiar Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
