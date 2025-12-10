'use client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { FaBars } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { sidebarLinks, settingsLinks, dashboardLinks } from '@/constants';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SocialBar from './SocialBar';
import { Logo } from '../Logo';
import { supabaseClient } from '@/lib/supabase/browserClient';

interface MobileSidebarProps {
  variant: string;
}

const MobileSidebar = ({ variant }: MobileSidebarProps) => {
  const pathname = usePathname();
  const showDashboardMenu = pathname.includes('/dashboard') || pathname.includes('/profile');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabaseClient.auth.getClaims().then(({ data }) => {
      setUser(data?.claims || null);
    });
  }, []);

  useEffect(() => {
    setQuery('');
    setOpen(false); // Close the sheet on route change
  }, [pathname]);

  return (
    <div className="z-16000 lg:hidden flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="text-3xl text-text-primary"
          onClick={() => setOpen(true)}
        >
          <FaBars />
        </SheetTrigger>
        <SheetContent
          className={cn(
            'pt-24 pb-10 px-4 flex w-[350px] flex-col justify-between gap-1 border-none bg-brand-primary text-text-primary',
            query.trim() ? 'overflow-hidden' : 'overflow-y-auto'
          )}
          side="left"
        >
          <SheetTitle className="hidden text-text-primary items-center justify-between px-4 py-2 text-3xl font-medium">
            Victoria Blush Collections
          </SheetTitle>
          <div className="flex flex-start flex-col gap-4 py-4">
            {(showDashboardMenu ? dashboardLinks : sidebarLinks).map((item) => {
              const isActive =
                (pathname.includes(item.route) && item.route.length > 1) ||
                pathname === item.route;

              return (
                <Link
                  href={item.route}
                  key={item.route}
                  className={`${isActive
                    ? 'rounded-xl bg-brand-secondary text-text-primary shadow-lg'
                    : 'text-text-primary hover:bg-brand-secondary/60 rounded-xl'
                    } flex items-center px-4 py-3 text-xl font-medium transition-all duration-200`}
                >
                  <div>{item.label}</div>
                </Link>
              );
            })}
            {user && (
              <>
                <Separator className="opacity-10" />
                {settingsLinks.map((item) => {
                  const isActive =
                    (pathname.includes(item.route) && item.route.length > 1) ||
                    pathname === item.route;

                  return (
                    <Link
                      href={item.route}
                      key={item.route}
                      className={`${isActive
                        ? 'rounded-xl bg-brand-primary text-white shadow-lg'
                        : 'text-white hover:bg-white/10 rounded-xl'
                        } flex items-center px-4 py-3 text-lg font-medium transition-all duration-200`}
                    >
                      <div>{item.label}</div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
          <Separator className="opacity-10" />
          <div className="flex">
            <SocialBar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
