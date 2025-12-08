'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/browserClient';

const UserContext = createContext<any>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<any>(undefined); // undefined means "loading"
  const router = useRouter();

  useEffect(() => {
    //const supabase = createClient();
    const supabase = supabaseClient;
    supabase.auth.getClaims().then(({ data }) => {
      setUser(data?.claims || null);
    });
  }, []);

  useEffect(() => {
    if (user === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  if (user === undefined) {
    // Still loading, render nothing or a spinner
    return null;
  }

  if (user === null) {
    // Don't render children while redirecting
    return null;
  }

  return (
    <UserContext.Provider value={user}>{children}</UserContext.Provider>
  );
}