'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  FaBell,
  FaCog,
  FaExclamation,
  FaHeart,
  FaImage,
  FaList,
  FaPaintBrush,
  FaPencilAlt,
  FaQuestionCircle,
  FaTshirt,
  FaUserEdit,
  FaUserPlus,
  FaVideo,
} from 'react-icons/fa';
import { GiRaven } from 'react-icons/gi';
import { RiQuestionnaireFill } from 'react-icons/ri';
import { BsPersonFillCheck } from 'react-icons/bs';

interface QuickLinksPopoverProps {
  profile?: {
    role: string;
  };
}

export default function QuickLinksPopover({ profile }: QuickLinksPopoverProps) {
  const [open, setOpen] = useState(false);

  const quickLinks = [
    { icon: FaUserEdit, label: 'Edit My Profile', href: '/dashboard/settings/edit-profile' },
    { icon: BsPersonFillCheck, label: 'Manage Subscription', href: '/dashboard/subscription' },
    { icon: FaBell, label: 'Notification Settings', href: '/dashboard/settings/notifications/add-agent' },
    { icon: FaExclamation, label: 'Spoiler Settings', href: '/dashboard/settings/spoilers' },
    { icon: FaCog, label: 'Other Settings', href: '/dashboard/settings/other/' },
    { icon: FaPaintBrush, label: 'Add Fan Art', href: '/dashboard/my-content/fan-art/add-fan-art' },
    { icon: FaTshirt, label: 'Add Cosplay', href: '/dashboard/my-content/cosplay/add-cosplay' },
    { icon: FaImage, label: 'Add Screenshot', href: '/dashboard/my-content/screenshots/add-screenshot' },
    { icon: FaVideo, label: 'Add Video', href: '/dashboard/my-content/videos/add-video' },
    { icon: FaQuestionCircle, label: 'Add Theory', href: '/dashboard/my-content/theories/add-theory' },
    { icon: FaPencilAlt, label: 'Add Article', href: '/dashboard/my-content/articles/add-article' },
    { icon: GiRaven, label: 'Add Thought', href: '/profile/activity?modal=true' },
    { icon: FaHeart, label: 'Manage Favourites', href: '/dashboard/my-favourites' },
    { icon: FaUserPlus, label: 'Manage Follows', href: '/dashboard/my-follows' },
  ];

  const adminLinks = [
    { icon: RiQuestionnaireFill, label: 'Edit Faqs', href: '/dashboard/faqs' },
    { icon: FaList, label: 'Edit Changelogs', href: '/dashboard/changelogs' },
  ];

  const allLinks =
    profile && profile.role === 'admin' ? [...quickLinks, ...adminLinks] : quickLinks;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer p-1 text-lg font-semibold text-foreground md:block hidden">MENU</div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={36}
        align="end"
        alignOffset={-120}
        className="z-15000 border border-border bg-popover text-foreground shadow-sm max-md:min-w-[320px] min-w-[500px]"
      >
        <div className="ml-2 mt-1 mb-5 text-xl font-semibold text-foreground">Quick Links</div>
        <div className="grid max-lg:grid-cols-1 grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {allLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-400 transition group"
              >
                <div className="rounded-full bg-primary/85 p-2 group-hover:bg-primary transition">
                  <IconComponent className="text-sm text-primary-foreground" />
                </div>
                <div className="font-medium text-foreground transition text-sm">{link.label}</div>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}