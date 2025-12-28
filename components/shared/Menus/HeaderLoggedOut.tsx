import Link from 'next/link';
import { Logo } from '../Logo';
import MobileSidebar from './MobileSidebar';
import QuickLinksPopover from '../QuickLinksPopover';

interface HeaderLoggedOutProps {
  mobileVariant: 'main' | 'dashboard';
}

export default function HeaderLoggedOut({ mobileVariant }: HeaderLoggedOutProps) {
  return (
    <div className="fixed top-0 left-0 z-10000 w-full h-[75px] lg:h-[90px] bg-background border-b border-border text-foreground shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:pl-12 lg:pr-14">
        {/* Left: Logo */}
        <div className="flex items-center">
          <div className="hidden flex-row items-center gap-22 lg:flex">
            <Link href="/" className="mr-6 lg:mr-10">
              <div className="h-auto w-[280px] -ml-2.5 px-0">
                <Logo width={280} height={40} sizes="280px" />
              </div>
            </Link>
          </div>
          <div className="lg:hidden">
            <MobileSidebar variant={mobileVariant} />
          </div>
        </div>

        {/* Right: quick links only; ThemeToggle and Account removed */}
        <div className="flex flex-row items-center gap-4 lg:gap-6">
          <QuickLinksPopover profile={undefined} />
        </div>
      </div>
    </div>
  );
}