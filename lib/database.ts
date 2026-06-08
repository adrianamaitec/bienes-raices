import { supabaseBrowser } from './supabase/client';

import { CreateDepartmentParams, Department, SupabaseResponse } from './types/types';
const supabase = supabaseBrowser();
export const fetchDepartments = async (): Promise<SupabaseResponse<Department[]>> => {
    const { data, error } = await supabase.from('departamentos').select('*');
    return { data, error };
};

export const createDepartment = async (
    department: CreateDepartmentParams
): Promise<SupabaseResponse<Department>> => {
    const { data, error } = await supabase.from('departamentos').insert([department]).single();
    return { data, error };
};