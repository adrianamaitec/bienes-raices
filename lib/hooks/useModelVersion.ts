// app/lib/hooks/useModelVersions.ts
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface ModelVersion {
    id: number;
    modelo_id: number;
    numero_version: number;
    url: string;
    notas?: string;
    created_at: string;
}

export function useModelVersions(modelId: number, supabaseUrl: string, supabaseKey: string) {
    const [versions, setVersions] = useState<ModelVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const res = await axios.get<ModelVersion[]>(
                `${supabaseUrl}/rest/v1/modelos_versiones?modelo_id=eq.${modelId}&select=*`,
                {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        Prefer: 'return=representation'
                    }
                }
            );
            setVersions(res.data.sort((a,b) => a.numero_version - b.numero_version));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateNotas = async (versionId: number, nuevasNotas: string) => {
        try {
            await axios.patch(
                `${supabaseUrl}/rest/v1/modelos_versiones?id=eq.${versionId}`,
                { notas: nuevasNotas },
                {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        Prefer: 'return=representation'
                    }
                }
            );

            setVersions(prev =>
                prev.map(v => v.id === versionId ? { ...v, notas: nuevasNotas } : v)
            );
        } catch (err: any) {
            console.error('Error actualizando notas:', err.message);
        }
    };

    useEffect(() => {
        if (modelId > 0) fetchVersions();
    }, [modelId]);

    return { versions, loading, error, updateNotas };
}
