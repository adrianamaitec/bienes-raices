// components/SignOutButton.tsx
"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Cerrar sesión
      </button>
      
    </>
  );
}
