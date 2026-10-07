'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays, ChevronDown, ClipboardList, Clock3, CreditCard, Globe, GraduationCap, History, House, ImageIcon, LayoutDashboard, ListChecks, LogOut, Mail, Menu, Settings2, UserRound, Video } from 'lucide-react';
import { TbHomeEdit } from 'react-icons/tb';
import { Logo } from '../Logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { signOutAction } from '@/app/(auth)/actions';
import { isSidebarLinkActive } from '@/lib/sidebar-navigation';
import styles from './dashboard-sidebar.module.css';

const groups = [
  { label: 'Overview', links: [
    { route: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: '/', label: 'View Website', icon: Globe },
  ] },
  { label: 'Bookings', links: [
    { route: '/dashboard/schedule', label: 'Schedule & Availability', icon: CalendarDays },
    { route: '/dashboard/schedule?view=bookings', label: 'Shift Session Bookings', icon: Video },
    { route: '/dashboard/schedule?view=appointments', label: 'Ovatu Appointments', icon: CalendarDays },
    { route: '/dashboard/schedule?view=weekly', label: 'Weekly Hours', icon: Clock3 },
    { route: '/dashboard/schedule?view=settings', label: 'Booking Settings', icon: Settings2 },
  ] },
  { label: 'Website', links: [
    { route: '/dashboard/edit-homepage', label: 'Edit Homepage', icon: TbHomeEdit },
    { route: '/dashboard/edit-education', label: 'Edit Education', icon: GraduationCap },
    { route: '/dashboard/services', label: 'Services', icon: ListChecks },
    { route: '/dashboard/gallery-images', label: 'Gallery Images', icon: ImageIcon },
  ] },
];
const websiteLinks = [
  { route: '/', label: 'Home', icon: House },
  { route: '/about', label: 'About', icon: UserRound },
  { route: '/services', label: 'Services', icon: ListChecks },
  { route: '/gallery', label: 'Gallery', icon: ImageIcon },
  { route: '/education', label: 'Education', icon: GraduationCap },
  { route: '/contact', label: 'Contact', icon: Mail },
];
const clientGroups = [
  { label: 'Your Account', links: [
    { route: '/dashboard/bookings', label: 'Booking History', icon: History },
    { route: '/dashboard/bookings?view=questionnaires', label: 'Questionnaires', icon: ClipboardList },
    { route: '/dashboard/bookings?view=refunds', label: 'Refunds', icon: CreditCard },
  ] },
  { label: 'Explore', links: [
    { route: '/dashboard/book-session', label: 'Book a Session', icon: CalendarDays },
    { route: '/contact', label: 'Contact Victoria', icon: Mail },
    { route: '/', label: 'View Website', icon: Globe },
  ] },
];
type SidebarProps = { profile: { username?: string | null; avatar_url?: string | null }; client?: boolean };

function Navigation({ onNavigate, client }: { onNavigate: () => void; client: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationGroups = client ? clientGroups : groups;
  const routes = navigationGroups.flatMap(group => group.links.map(link => link.route));
  return <>{navigationGroups.map(group => <section key={group.label} className={styles.group} aria-label={group.label}>
    <h2>{group.label}</h2>
    {group.links.map(({ route, label, icon: Icon }) => route === '/' ? <details key={route} className={styles.websiteMenu} open={client}>
      <summary className={styles.link}><Icon aria-hidden="true" /><span>{label}</span><ChevronDown className={styles.chevron} aria-hidden="true" /></summary>
      <div className={styles.websiteLinks}>{websiteLinks.map(({ route: pageRoute, label: pageLabel, icon: PageIcon }) => <Link key={pageRoute} href={pageRoute} className={styles.link} onClick={onNavigate}><PageIcon aria-hidden="true" /><span>{pageLabel}</span></Link>)}</div>
    </details> : <Link key={route} href={route} className={styles.link} onClick={onNavigate} aria-current={isSidebarLinkActive(route, pathname, searchParams, routes) ? 'page' : undefined}><Icon aria-hidden="true" /><span>{label}</span></Link>)}
  </section>)}</>;
}

function SidebarContent({ profile, client = false, onNavigate }: SidebarProps & { onNavigate: () => void }) {
  const pathname = usePathname();
  return <div className={styles.content}>
    <Link href={client ? '/dashboard/bookings' : '/dashboard'} className={styles.brand} onClick={onNavigate} aria-label="Victoria Blush Collections Dashboard"><span className={styles.brandLogo}><Logo fill sizes="228px" alt="Victoria Blush Collections" /></span></Link>
    <nav className={styles.navigation} aria-label="Dashboard Navigation"><Suspense fallback={null}><Navigation onNavigate={onNavigate} client={client} /></Suspense></nav>
    <footer className={styles.footer}>
      <div className={styles.profile}><Image src={profile.avatar_url || '/assets/images/Default_Avatar.jpg'} alt="" width={32} height={32} /><div><strong>{profile.username || (client ? 'Your Account' : 'Victoria Blush')}</strong><span>{client ? 'Client' : 'Administrator'}</span></div></div>
      <Link href="/dashboard/edit-profile" className={styles.link} onClick={onNavigate} aria-current={pathname === '/dashboard/edit-profile' ? 'page' : undefined}><UserRound aria-hidden="true" /><span>{client ? 'Edit Avatar' : 'Edit Profile'}</span></Link>
      <form action={signOutAction}><button type="submit" className={styles.link}><LogOut aria-hidden="true" /><span>Sign Out</span></button></form>
    </footer>
  </div>;
}

export default function Sidebar({ profile, client = false }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <aside className={styles.rail}><SidebarContent profile={profile} client={client} onNavigate={close} /></aside>
    <div className={styles.mobileBar}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className={styles.trigger} aria-label="Open Dashboard Navigation" title="Open Dashboard Navigation"><Menu size={20} /></SheetTrigger>
        <span>Victoria Blush Collections</span>
        <SheetContent side="left" className={styles.drawer} aria-describedby={undefined}>
          <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
          <SidebarContent profile={profile} client={client} onNavigate={close} />
        </SheetContent>
      </Sheet>
    </div>
  </>;
}