import { supabase } from './supabaseClient';

export const fetchApartments = async () => {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    return data;
};

export const createApartment = async (apartmentData: any) => {
    const { data, error } = await supabase.from('departments').insert([apartmentData]);
    if (error) throw error;
    return data;
};