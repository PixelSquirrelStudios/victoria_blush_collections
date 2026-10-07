'use client';

import { SidebarLinkExtended } from '@/types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { isSidebarLinkActive } from '@/lib/sidebar-navigation';

const SidebarMenuContent = ({
  sidebarLinks,
}: {
  sidebarLinks: SidebarLinkExtended[];
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className='flex flex-col justify-between gap-0'>

      {sidebarLinks.map((item: SidebarLinkExtended) => {
        const isActive = isSidebarLinkActive(item.route, pathname, searchParams, sidebarLinks.map(link => link.route));

        return (
          <Link
            href={item.route}
            aria-current={isActive ? 'page' : undefined}
            key={item.label}
            className={`${isActive
              ? 'bg-brand-secondary/85'
              : 'text-stone-800 hover:bg-brand-secondary/80 transition-all'
              } flex items-center gap-4 ml-[-12px] text-xl font-semibold px-3 py-2.5 text-stone-800 rounded-xl`}
          >
            <div className='text-xl'>{item.icon}</div>
            <div className='text-base font-medium tracking-wide'>
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default function SidebarMenu(props: { sidebarLinks: SidebarLinkExtended[] }) {
  return <Suspense fallback={null}><SidebarMenuContent {...props} /></Suspense>;
}
