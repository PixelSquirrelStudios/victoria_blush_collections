import { SidebarLink } from '@/types';
import {
  FaHome,
  FaInfoCircle,
  FaRss,
  FaQuestionCircle,
  FaCog,
  FaUser,
  FaHeart,
  FaUsers,
  FaTrophy,
  FaTshirt,
  FaUserPlus,
  FaCoins,
  FaGift,
} from 'react-icons/fa';
import {
  FaBagShopping,
  FaPaintbrush,
  FaPhotoFilm,
} from 'react-icons/fa6';
import { GiVhs } from 'react-icons/gi';
import { BsPersonFillCheck } from "react-icons/bs";
import { MdAdminPanelSettings, MdArticle } from 'react-icons/md';
import { RiLayout5Fill, RiMegaphoneFill } from 'react-icons/ri';

export const NOTIFICATION_AUDIO_URL = '/assets/audio/notification.mp3';
export const DEFAULT_AVATAR_URL =
  '/assets/images/Default_Avatar.jpg';

export const sidebarLinks: SidebarLink[] = [
  { icon: <FaHome />, route: '/', label: 'Home' },
  { icon: <FaRss />, route: '/activity-feed', label: 'Activity Feed' },
  { icon: <RiMegaphoneFill />, route: '/news', label: 'News' },
  { icon: <FaPaintbrush />, route: '/fan-art', label: 'Fan Art' },
  { icon: <FaTshirt />, route: '/cosplay', label: 'Cosplay' },
  { icon: <GiVhs />, route: '/media', label: 'Media' },
  { icon: <FaQuestionCircle />, route: '/theories', label: 'Theories' },
  { icon: <MdArticle />, route: '/articles', label: 'Articles' },
  { icon: <FaUsers />, route: '/fans', label: 'Fans' },
  { icon: <FaTrophy />, route: '/unlockables', label: 'Unlockables' },
  { icon: <FaBagShopping />, route: '/the-mall', label: 'The Mall' },
  { icon: <FaInfoCircle />, route: '/help-info', label: 'Help & Info' },
];

export const dashboardLinks: SidebarLink[] = [
  { icon: <FaHome />, route: '/', label: 'Site Home' },
  { icon: <FaCog />, route: '/dashboard/settings', label: 'Account & Settings' },
  { icon: <FaPhotoFilm />, route: '/dashboard/my-content', label: 'My Content' },
  { icon: <FaHeart />, route: '/dashboard/my-favourites', label: 'My Favourites' },
  { icon: <FaUserPlus />, route: '/dashboard/my-follows', label: 'My Follows' },
  { icon: <FaTrophy />, route: '/dashboard/my-unlocks', label: 'My Unlocks' },
  { icon: <FaCoins />, route: '/dashboard/my-earnings', label: 'My Earns & Spends' },
  { icon: <FaGift />, route: '/dashboard/my-contest-entries', label: 'My Contest Entries' },
  { icon: <BsPersonFillCheck />, route: '/dashboard/subscription', label: 'My Subscription' },
];

export const dashboardLinksAdmin: SidebarLink[] = [
  { icon: <FaPhotoFilm />, route: '/dashboard/content', label: 'All Content' },
  { icon: <FaCoins />, route: '/dashboard/earnings', label: 'All Earnings' },
  { icon: <FaTrophy />, route: '/dashboard/unlockables', label: 'Unlockables' },
  { icon: <MdAdminPanelSettings />, route: '/dashboard/admin', label: 'Admin' },
];

export const settingsLinks: SidebarLink[] = [
  { icon: <RiLayout5Fill />, route: '/dashboard', label: 'Dashboard' },
  { icon: <FaUser />, route: '/profile', label: 'My Profile' },
];