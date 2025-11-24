// app/hooks/useModelsWithVersions.ts
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Department {
    id: number;
    name: string;
    image_url?: string;
}

export interface ModelVersion {
    id: number;
    modelo_id: number;
    numero_version: number;
    url: string;
    notas?: string;
    created_at: string;
}

export interface Model {
    id: number;
    department_id: number;
    storage_url: string;
    created_at: string;
    department?: Department;
    versions?: ModelVersion[];
}

export function useModelsWithVersions(supabaseUrl: string, supabaseKey: string) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = async () => {
        try {
            setLoading(true);
            // Traer departamentos
            const deptRes = await axios.get<Department[]>(
                `${supabaseUrl}/rest/v1/departments?select=*`,
                {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        Prefer: 'return=representation'
                    }
                }
            );
            setDepartments(deptRes.data);

            // Traer modelos
            const modelRes = await axios.get<Model[]>(
                `${supabaseUrl}/rest/v1/modelos?select=*,departments(*)`,
                {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        Prefer: 'return=representation'
                    }
                }
            );

            // Traer todas las versiones
            const versionRes = await axios.get<ModelVersion[]>(
                `${supabaseUrl}/rest/v1/modelos_versiones?select=*`,
                {
                    headers: {
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        Prefer: 'return=representation'
                    }
                }
            );

            // Mapear versiones a modelos
            const modelsWithVersions = modelRes.data.map((m: Model) => ({
                ...m,
                department: deptRes.data.find((d: Department) => d.id === m.department_id),
                versions: versionRes.data
                    .filter((v: ModelVersion) => v.modelo_id === m.id)
                    .sort((a: ModelVersion, b: ModelVersion) => a.numero_version - b.numero_version)
            }));

            setModels(modelsWithVersions);
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
            setModels(prev =>
                prev.map(m => ({
                    ...m,
                    versions: m.versions?.map(v =>
                        v.id === versionId ? { ...v, notas: nuevasNotas } : v
                    )
                }))
            );
        } catch (err: any) {
            console.error('Error actualizando notas:', err.message);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    return { models, departments, loading, error, updateNotas, fetchModels };
}
