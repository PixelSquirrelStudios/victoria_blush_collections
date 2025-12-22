import { fetchUserData } from '@/app/hooks/useUser';
import Link from 'next/link';
import MobileSidebar from './MobileSidebar';
import { Logo } from '../Logo';
import ProfileButtonServer from '../ActionButtons/ProfileButtonServer';

interface HeaderProps {
  mobileVariant: 'main' | 'dashboard';
  isHome?: boolean; // add this
}

const Header = async ({ mobileVariant, isHome = false }: HeaderProps) => {
  const { user, profile } = await fetchUserData();

  const sections = [
    { name: 'Home', id: '' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Gallery', id: 'gallery' },
  ];

  // Build hrefs from the explicit flag:
  // - On home: Home -> '#', others -> '#id'
  // - Off home: Home -> '/', others -> '/#id'
  const navLinks = sections.map((s) => {
    if (s.name === 'Home') {
      return { name: s.name, href: isHome ? '#' : '/' };
    }
    return { name: s.name, href: isHome ? `#${s.id}` : `/#${s.id}` };
  });

  const bookNowHref = isHome ? '#contact' : '/#contact';

  return (
    <div className="fixed top-0 left-0 z-10000 w-full h-[75px] lg:h-[90px] bg-brand-secondary border-b border-brand-secondary text-stone-800 shadow-md">
      <div className="flex w-full h-full items-center justify-between px-4 lg:px-24 2xl:px-52">
        {/* Left: Logo + Mobile sidebar */}
        <div className="flex items-center max-md:w-full justify-between">
          <div className="flex-row items-center gap-22 flex">
            <Link href="/" className="mr-6 lg:mr-10">
              <div className="h-auto -ml-2.5 px-0" style={{ width: 150 }}>
                <Logo width={150} height={40} forceTheme="light" />
              </div>
            </Link>
          </div>
          <div className="md:hidden w-full flex justify-end mr-4">
            <MobileSidebar variant={mobileVariant} />
          </div>
        </div>

        {/* Right: Desktop nav + optional profile */}
        <div className="flex flex-row items-center gap-6 lg:gap-8">
          {profile ? <ProfileButtonServer user={user} profile={profile} /> : null}

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium transition-colors duration-300 text-lg text-stone-800 hover:text-stone-700"
              >
                {link.name}
              </a>
            ))}
            <a
              href={bookNowHref}
              className="px-6 py-2 bg-bg-muted text-text-primary font-semibold rounded hover:bg-bg-muted/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;