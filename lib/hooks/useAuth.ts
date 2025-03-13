import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();
    }, []);

    return user;
};