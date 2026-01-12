'use client';

import Link from 'next/link';
import MobileSidebar from './MobileSidebar';
import { Logo } from '../Logo';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/browserClient';
import Image from 'next/image';
import { DEFAULT_AVATAR_URL } from '@/constants';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { LucideAppWindow } from 'lucide-react';
import { signOutAction } from '@/app/(auth)/actions';

interface HeaderProps {
  mobileVariant: 'main' | 'dashboard';
  isHomepage?: boolean;
}

const Header = ({ mobileVariant, isHomepage: isHomepageProp }: HeaderProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);
      }
    };

    fetchUser();
  }, []);
  const isHomepage = isHomepageProp !== undefined ? isHomepageProp : pathname === '/';

  const sections = [
    { name: 'Home', id: '', page: '/' },
    { name: 'About', id: 'about', page: '/about' },
    { name: 'Services', id: 'services', page: '/services' },
    { name: 'Gallery', id: 'gallery', page: '/gallery' },
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
          {profile && user ? (
            <div className="flex items-center gap-4 text-md font-semibold text-foreground">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer">
                    <Image
                      src={profile.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${profile.username || 'User'}'s avatar`}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2 border-text-secondary"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="z-10000 w-84 px-6 pt-6 pb-4 bg-brand-primary text-text-primary border border-text-secondary rounded-xl shadow-lg"
                  side="bottom"
                  sideOffset={36}
                  align="start"
                >
                  <div className="flex gap-3 items-center">
                    <Image
                      src={profile.avatar_url || DEFAULT_AVATAR_URL}
                      alt={`${profile.username || 'User'}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover border-2 border-text-secondary"
                    />
                    <div className="flex flex-col">
                      <div className="text-text-primary flex flex-row flex-wrap items-center gap-2">
                        <div className="mt-0.5 font-semibold">{profile.username || 'Unknown User'}</div>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4 opacity-50" />
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/dashboard"
                      className="w-full flex items-center gap-1.5 py-2 px-2 rounded-xl text-[16px] font-medium transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
                    >
                      <LucideAppWindow className="mr-1 text-xl" />
                      Dashboard
                    </Link>
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
                </PopoverContent>
              </Popover>
            </div>
          ) : null}

          <div className="hidden md:flex items-center gap-8">
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

          <div className="md:hidden shrink-0">
            <MobileSidebar variant={mobileVariant} isHomepage={isHomepage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;