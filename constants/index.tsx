import { SidebarLink } from '@/types';

export const NOTIFICATION_AUDIO_URL = '/assets/audio/notification.mp3';
export const DEFAULT_AVATAR_URL =
  '/assets/images/Default_Avatar.jpg';

export const sidebarLinks: SidebarLink[] = [
  { route: '/', label: 'Home' },
  { route: '/#about', label: 'About' },
  { route: '/#pricing', label: 'Pricing' },
  { route: '/#gallery', label: 'Gallery' },
  { route: '/#contact', label: 'Contact' },
];

export const dashboardLinks: SidebarLink[] = [
  { route: '/', label: 'Site Home' },
  { route: '/dashboard/settings', label: 'Account & Settings' },
  { route: '/dashboard/my-content', label: 'My Content' },
  { route: '/dashboard/my-favourites', label: 'My Favourites' },
  { route: '/dashboard/my-follows', label: 'My Follows' },
  { route: '/dashboard/my-unlocks', label: 'My Unlocks' },
  { route: '/dashboard/my-earnings', label: 'My Earns & Spends' },
  { route: '/dashboard/my-contest-entries', label: 'My Contest Entries' },
  { route: '/dashboard/subscription', label: 'My Subscription' },
];

export const dashboardLinksAdmin: SidebarLink[] = [
  { route: '/dashboard/content', label: 'All Content' },
  { route: '/dashboard/earnings', label: 'All Earnings' },
  { route: '/dashboard/unlockables', label: 'Unlockables' },
  { route: '/dashboard/admin', label: 'Admin' },
];

export const settingsLinks: SidebarLink[] = [
  { route: '/dashboard', label: 'Dashboard' },
];