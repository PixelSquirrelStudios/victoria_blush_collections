'use client';

import { SidebarLinkExtended } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarMenu = ({
  sidebarLinks,
}: {
  sidebarLinks: SidebarLinkExtended[];
}) => {
  const pathname = usePathname();

  return (
    <div className='flex flex-col justify-between gap-1'>

      {sidebarLinks.map((item: SidebarLinkExtended) => {
        const isActive =
          (pathname.includes(item.route + '/') &&
            item.route !== '/dashboard' &&
            item.route.length > 1) ||
          pathname === item.route;

        return (
          <Link
            href={item.route}
            key={item.label}
            className={`${isActive
              ? 'bg-brand-secondary/85'
              : 'text-stone-800 hover:bg-brand-secondary/80 transition-all'
              } flex items-center gap-5 ml-[-12px] text-2xl font-semibold px-3 py-3 text-stone-800 rounded-xl`}
          >
            <div className='text-2xl'>{item.icon}</div>
            <div className='text-xl font-medium tracking-wide'>
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
