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

interface MobileSidebarProps {
  variant: string;
}

const MobileSidebar = ({ variant }: MobileSidebarProps) => {
  const pathname = usePathname();
  const showDashboardMenu = pathname.includes('/dashboard') || pathname.includes('/profile');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery('');
    setOpen(false); // Close the sheet on route change
  }, [pathname]);

  return (
    <div className="z-16000 lg:hidden flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="text-3xl text-white"
          onClick={() => setOpen(true)}
        >
          <FaBars />
        </SheetTrigger>
        <SheetContent
          className={cn(
            'pt-20 flex w-[390px] flex-col justify-between gap-1 border-none bg-black/90 text-white',
            query.trim() ? 'overflow-hidden' : 'overflow-y-auto'
          )}
          side="left"
        >
          <SheetTitle className="hidden text-white items-center justify-between px-4 py-2 text-3xl font-bold">
            Lost Records Fans
          </SheetTitle>
          <div className="w-[280px] h-[70px] ml-[-10px] px-0 py-4">
            <Image
              src="/assets/images/Lost_Records_Fans_Logo_Wide.png"
              alt="Logo"
              className="w-full h-full object-contain"
              width={800}
              height={200}
              priority
            />
          </div>
          <div className="flex flex-col justify-between gap-1 py-4">
            {(showDashboardMenu ? dashboardLinks : sidebarLinks).map((item) => {
              const isActive =
                (pathname.includes(item.route) && item.route.length > 1) ||
                pathname === item.route;

              return (
                <Link
                  href={item.route}
                  key={item.route}
                  className={`${isActive
                    ? variant === 'main'
                      ? 'ml-[-12px] rounded-xl bg-primary-main px-3 py-1.5 text-white'
                      : 'ml-[-12px] rounded-xl bg-secondary-main px-3 py-1.5 text-white'
                    : 'text-white'
                    } flex items-center gap-6 py-4 text-2xl font-semibold`}
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div className="text-lg font-normal">{item.label}</div>
                </Link>
              );
            })}
          </div>
          <Separator className="opacity-[10%]" />
          {settingsLinks.map((item) => {
            const isActive =
              (pathname.includes(item.route) && item.route.length > 1) ||
              pathname === item.route;

            return (
              <Link
                href={item.route}
                key={item.route}
                className={`${isActive
                  ? 'ml-[-12px] rounded-xl bg-secondary-main px-3 py-1.5 text-white'
                  : 'text-white'
                  } flex items-center gap-6 py-4 text-2xl font-semibold`}
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="text-lg font-normal">{item.label}</div>
              </Link>
            );
          })}
          <Separator className="opacity-[10%]" />
          <div className="flex justify-items-end">
            <SocialBar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
