'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase/client';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
}

export default function UserNavbarInfo() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = supabaseBrowser();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, profile_image_url')
        .eq('id', authUser.id)
        .single();

      if (!error && data) setUser(data);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      <Image
        src={user.profile_image_url || '/default-avatar.png'}
        alt="avatar"
        width={36}
        height={36}
        className="rounded-full object-cover"
      />
      <span className="font-medium text-gray-800">
        {user.first_name} {user.last_name}
      </span>
    </div>
  );
}
