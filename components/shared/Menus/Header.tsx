'use client';

import Link from 'next/link';
import MobileSidebar from './MobileSidebar';
import { Logo } from '../Logo';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/browserClient';
import Image from 'next/image';
import { DEFAULT_AVATAR_URL } from '@/constants';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { CalendarDays, CircleUserRound, LucideAppWindow, UserPlus } from 'lucide-react';
import { signOutAction } from '@/app/(auth)/actions';

interface HeaderProps {
  mobileVariant: 'main' | 'dashboard';
  isHomepage?: boolean;
}

interface HeaderProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

const Header = ({ mobileVariant, isHomepage: isHomepageProp }: HeaderProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loadedProfile, setProfile] = useState<HeaderProfile | null>(null);
  const profile = loadedProfile?.id === user?.id ? loadedProfile : null;
  const userId = user?.id;
  const displayName = profile?.username || user?.user_metadata?.username || 'Your Account';
  const isAdmin = profile?.role === 'admin';
  const isClient = !isAdmin && (profile?.role === 'client' || user?.app_metadata?.role === 'client');

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const fetchProfile = async () => {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id,username,avatar_url,role')
        .eq('id', userId)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.error('Could not load header profile:', error);
        toast.error('Could not load your profile. Please refresh to try again.');
        return;
      }
      setProfile(data);
    };

    void fetchProfile();
    return () => { active = false; };
  }, [userId, pathname]);
  const isHomepage = isHomepageProp !== undefined ? isHomepageProp : pathname === '/';

  const sections = [
    { name: 'Home', id: '', page: '/' },
    { name: 'About', id: 'about', page: '/about' },
    { name: 'Services', id: 'services', page: '/services' },
    { name: 'Gallery', id: 'gallery', page: '/gallery' },
    { name: 'Education & Salon Support', id: 'education', page: '/education' },
  ];

  // Build hrefs based on whether we're on the homepage:
  // - On homepage: use #id links to scroll within the page (exclude Home link)
  // - Off homepage: link to separate pages
  const navLinks = sections
    .filter((s) => !(isHomepage && s.name === 'Home')) // Hide Home link when on homepage
    .map((s) => {
      if (s.name === 'Home') {
        return { name: s.name, href: '/' };
      }
      // Education is always a separate page link
      if (s.page && !['/', '/about', '/services', '/gallery'].includes(s.page)) {
        return { name: s.name, href: s.page };
      }
      return { name: s.name, href: isHomepage ? `#${s.id}` : s.page };
    });

  const bookNowHref = isHomepage ? '#contact' : '/contact';

  return (
    <div className="fixed top-0 left-0 z-10000 w-full h-[75px] lg:h-[90px] bg-brand-secondary border-b border-brand-secondary text-stone-800 shadow-md">
      <div className="flex w-full h-full items-center justify-between px-5 pr-8 md:px-16 lg:px-24 2xl:px-52">
        {/* Left: Logo */}
        <Link href="/" className="mr-4 lg:mr-10">
          <Logo width={280} height={40} sizes="180px" />
        </Link>

        {/* Right: Profile + Nav + Mobile sidebar */}
        <div className="flex flex-row items-center gap-3 md:gap-6 lg:gap-8">
            <div className="flex items-center gap-4 text-md font-semibold text-foreground">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={user ? 'Open account menu' : 'Sign In'}
                    className={user
                      ? 'flex items-center gap-2 whitespace-nowrap cursor-pointer'
                      : 'flex items-center justify-center cursor-pointer rounded-full border border-text-secondary bg-brand-primary p-1 text-text-primary shadow-sm transition-colors hover:bg-bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-secondary'}
                  >
                    {user ? <Image
                      src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${displayName}'s avatar`}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2 border-text-secondary"
                    /> : <CircleUserRound size={24} aria-hidden="true" />}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-10000 w-84 px-6 pt-6 pb-4 bg-brand-primary text-text-primary border border-text-secondary rounded-xl shadow-lg"
                  side="bottom"
                  sideOffset={36}
                  align="start"
                >
                  {user ? <>
                  <div className="flex gap-3 items-center">
                    <Image
                      src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${displayName}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover border-2 border-text-secondary"
                    />
                    <div className="flex flex-col">
                      <div className="text-text-primary flex flex-row flex-wrap items-center gap-2">
                        <div className="mt-0.5 font-semibold">{displayName}</div>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4 opacity-50" />
                  <div className="flex flex-col gap-1">
                    {isClient && <Link href="/dashboard/bookings" className="w-full flex items-center gap-2 py-2 px-2 rounded text-base hover:bg-brand-secondary/60"><CalendarDays size={20} /> Manage Bookings</Link>}
                    {isAdmin && (
                    <Link
                      href="/dashboard"
                      className="w-full flex items-center gap-1.5 py-2 px-2 rounded-xl text-[16px] font-medium transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
                    >
                      <LucideAppWindow className="mr-1 text-xl" />
                      Dashboard
                    </Link>
                    )}
                    <form action={signOutAction} className="w-full">
                      <button
                        type="submit"
                        className="w-full text-left text-base font-medium rounded-xl flex items-center justify-start gap-1.5 py-2 px-2 transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
                      >
                        <FaSignOutAlt className="mr-2 text-xl" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                  </> : <>
                  <Link
                    href="/sign-in"
                    className="w-full flex items-center gap-2 py-2 px-2 rounded-xl text-base font-medium transition-colors duration-200 hover:bg-brand-secondary/60"
                  >
                    <CircleUserRound size={20} aria-hidden="true" />
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="w-full flex items-center gap-2 py-2 px-2 rounded-xl text-base font-medium transition-colors duration-200 hover:bg-brand-secondary/60"
                  >
                    <UserPlus size={20} aria-hidden="true" />
                    Sign Up
                  </Link>
                  </>}
                </PopoverContent>
              </Popover>
            </div>

          <div className="hidden xl:flex items-center gap-8">
            {navLinks.map((link) =>
              isHomepage ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="font-medium transition-colors duration-300 text-lg text-stone-800 hover:text-stone-700"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-medium transition-colors duration-300 text-lg text-stone-800 hover:text-stone-700"
                >
                  {link.name}
                </Link>
              )
            )}
            {isHomepage ? (
              <a
                href={bookNowHref}
                className="px-6 py-2 bg-bg-muted text-text-primary font-semibold rounded hover:bg-bg-muted/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Book Now
              </a>
            ) : (
              <Link
                href={bookNowHref}
                className="px-6 py-2 bg-bg-muted text-text-primary font-semibold rounded hover:bg-bg-muted/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Book Now
              </Link>
            )}
          </div>

          <div className="xl:hidden shrink-0">
            <MobileSidebar variant={mobileVariant} isHomepage={isHomepage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;