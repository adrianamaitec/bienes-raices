import { supabase } from './supabaseClient';

export const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('apartment-models').upload(path, file);
    if (error) throw error;
    return data;
};