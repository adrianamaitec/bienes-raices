import { supabase } from './supabaseClient';

import { CreateDepartmentParams, Department, SupabaseResponse } from './types/types';

export const fetchDepartments = async (): Promise<SupabaseResponse<Department[]>> => {
    const { data, error } = await supabase.from('departments').select('*');
    return { data, error };
};

export const createDepartment = async (
    department: CreateDepartmentParams
): Promise<SupabaseResponse<Department>> => {
    const { data, error } = await supabase.from('departments').insert([department]).single();
    return { data, error };
};