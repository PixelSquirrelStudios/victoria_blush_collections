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
    <div className="fixed top-0 left-0 z-10000 w-full h-[75px] lg:h-[90px] bg-brand-secondary border-b border-brand-secondary text-stone-800 shadow-md flex items-center px-8 2xl:px-52">

      <div className="shrink-0">
        {/* Left: Logo */}
        <Link href="/" className="mr-0 lg:mr-8 inline-block">
          <span className="md:hidden inline-block align-middle">
            <Logo width={160} height={40} sizes="120px" />
          </span>
          <span className="hidden md:inline-block align-middle">
            <Logo width={280} height={40} sizes="180px" />
          </span>
        </Link>
      </div>
      {/* Right: Profile + Nav + Mobile sidebar */}
      <div className="ml-auto flex flex-row items-center 2xl:gap-8 gap-4 min-w-0">
        {profile ? (
          <div className="shrink-0">
            <ProfileButtonServer user={user} profile={profile} />
          </div>
        ) : null}

        <div className="hidden xl:flex items-center gap-8">
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
        <div className="xl:hidden shrink-0">
          <MobileSidebar variant={mobileVariant} />
        </div>
      </div>

    </div>

  );
};

export default Header;