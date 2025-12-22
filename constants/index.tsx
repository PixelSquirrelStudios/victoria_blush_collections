import { SidebarLink, SidebarLinkExtended } from '@/types';
import { LucideAppWindow } from 'lucide-react';
import { FaCog, FaEnvelope, FaHome, FaImage, FaImages, FaList, FaListAlt, FaQuestionCircle, FaStar, FaUser, FaUserCog } from 'react-icons/fa';
import { TbEdit, TbHomeEdit, TbPhotoEdit } from "react-icons/tb";
import { MdEditNote } from 'react-icons/md';
import { StylesConfig } from 'react-select';

export const NOTIFICATION_AUDIO_URL = '/assets/audio/notification.mp3';
export const DEFAULT_AVATAR_URL =
  '/assets/images/Default_Avatar.jpg';

export const sidebarLinks: SidebarLink[] = [
  { route: '/', label: 'Home' },
  { route: '/#about', label: 'About' },
  { route: '/#services', label: 'Services' },
  { route: '/#gallery', label: 'Gallery' },
  { route: '/#contact', label: 'Contact' },
];

export const dashboardLinks: SidebarLink[] = [
  { route: '/', label: 'Site Home' },
  { route: '/dashboard', label: 'Dashboard Home' },
  { route: '/dashboard/edit-profile', label: 'Edit Profile' },
  { route: '/dashboard/edit-homepage', label: 'Edit Homepage' },
  { route: '/dashboard/services', label: 'Services' },
  { route: '/dashboard/gallery', label: 'Gallery' },
];

export const dashboardLinksAdmin: SidebarLink[] = [
  { route: '/dashboard/content', label: 'All Content' },
  { route: '/dashboard/earnings', label: 'All Earnings' },
  { route: '/dashboard/unlockables', label: 'Unlockables' },
  { route: '/dashboard/admin', label: 'Admin' },
];

export const settingsLinks: SidebarLink[] = [];

export const sideBarLinksMain: SidebarLinkExtended[] = [
  {
    icon: <FaHome />,
    route: '/',
    label: 'Site Home',
  },
  {
    icon: <FaUser />,
    route: '/#about',
    label: 'About',
  },
  {
    icon: <FaListAlt />,
    route: '/#services',
    label: 'Services',
  },
  {
    icon: < FaImage />,
    route: '/#gallery',
    label: 'Gallery',
  },
  {
    icon: < FaEnvelope />,
    route: '/#contact',
    label: 'Contact',
  },
];

export const sideBarLinksDashboard: SidebarLinkExtended[] = [
  {
    icon: < LucideAppWindow />,
    route: '/dashboard',
    label: 'Dashboard Home',
  },
  {
    icon: < TbHomeEdit />,
    route: '/dashboard/edit-homepage',
    label: 'Edit Homepage',
  },
  {
    icon: <TbEdit />,
    route: '/dashboard/services',
    label: 'Services',
  },
  {
    icon: <TbPhotoEdit />,
    route: '/dashboard/gallery-images',
    label: 'Gallery Images',
  },
];

export const customSelectStyles = (
  variant: 'default' | 'form'
): StylesConfig<any, true> => {
  return {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: variant === 'default' ? '10px!important' : '4px!important',
      boxShadow: 'none',
      minHeight: variant === 'default' ? '48px!important' : '38px!important',
      overflow: 'hidden',
      alignItems: 'center',
      paddingLeft: variant === 'default' ? '15px' : '0px',
      '&:hover': {
        borderColor: '#fff',
        cursor: 'pointer',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? '#fff' : '#000',
      backgroundColor: state.isSelected ? '#e20098' : '#fff',
      '&:hover': {
        backgroundColor: '#2c2f29',
        color: '#fff',
        cursor: 'pointer',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#2c2f29',
      color: '#fff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#fff',
      backgroundColor: '#000',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#222',
        color: '#fff',
      },
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 1050,
      className: 'custom-select-portal',
    }),
  };
};