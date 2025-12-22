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
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SocialBar from '../SocialBar';
import { Logo } from '../Logo';
import { supabaseClient } from '@/lib/supabase/browserClient';
import { signOutAction } from '@/app/(auth)/actions';
import { FaSignOutAlt } from 'react-icons/fa';

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
    <div className="lg:hidden flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        {variant === 'dashboard' ? (
          <SheetTrigger
            className="mb-4 bg-bg-primary shadow-md px-3 py-1 rounded-sm text-2xl text-text-primary"
            onClick={() => setOpen(true)}
          >
            <div className='flex flex-row gap-2 items-center'>
              <FaBars />
              <div className='text-2xl font-medium'>MENU</div>
            </div>
          </SheetTrigger>
        ) : (
          <SheetTrigger
            className="bg-bg-primary shadow-md px-3 py-2 rounded-sm text-2xl text-text-primary"
            onClick={() => setOpen(true)}
          >
            <FaBars />
          </SheetTrigger>
        )}
        <SheetContent
          className={cn(
            'pb-10 px-4 flex w-[350px] flex-col justify-between gap-1 border-none bg-brand-primary text-text-primary',
            query.trim() ? 'overflow-hidden' : 'overflow-y-auto',
            variant === 'dashboard' ? 'pt-10' : 'pt-20'

          )}
          side="left"
        >
          <SheetTitle className="hidden text-text-primary items-center justify-between px-4 py-2 text-3xl font-medium">
            Victoria Blush Collections
          </SheetTitle>
          <div className="flex flex-start flex-col gap-4 py-4">
            {variant === 'dashboard' && (
              <div>
                <Logo sizes='small' className="h-18 w-auto" />
              </div>
            )}
            {(showDashboardMenu ? dashboardLinks : sidebarLinks).map((item) => {
              const isActive =
                (pathname.includes(item.route + '/') &&
                  item.route !== '/dashboard' &&
                  item.route.length > 1) ||
                pathname === item.route;

              return (
                <Link
                  href={item.route}
                  key={item.route}
                  onClick={() => setOpen(false)}
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
                    (pathname.includes(item.route + '/') &&
                      item.route !== '/dashboard' &&
                      item.route.length > 1) ||
                    pathname === item.route;

                  return (
                    <Link
                      href={item.route}
                      key={item.route}
                      onClick={() => setOpen(false)}
                      className={`${isActive
                        ? 'rounded-xl bg-brand-secondary text-text-primary shadow-lg'
                        : 'text-white hover:bg-white/10 rounded-xl'
                        } flex items-center px-4 py-3 text-lg font-medium transition-all duration-200`}
                    >
                      <div>{item.label}</div>
                    </Link>
                  );
                })}
                <form action={signOutAction} className="w-full">
                  <button
                    type="submit"
                    className="w-full text-left text-text-primary hover:bg-brand-secondary/60 rounded-xl flex items-center justify-start gap-3 px-4 py-3 text-xl font-medium transition-all duration-200"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </>
            )}
          </div>
          <Separator className="opacity-10" />
          {variant !== 'dashboard' && (
            <div className="flex">
              <SocialBar />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
