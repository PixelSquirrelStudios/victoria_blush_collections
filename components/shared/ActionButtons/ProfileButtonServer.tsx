import Image from 'next/image';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { signOutAction } from '@/app/(auth)/actions';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { LucideAppWindow } from 'lucide-react';

interface ProfileButtonProps {
  user: any;
  profile: any;
}

const ProfileButtonServer = async ({ user, profile }: ProfileButtonProps) => {
  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-4 text-md font-semibold text-foreground">
        <div className="flex w-[30px] h-[30px] items-center justify-center rounded-full bg-muted border border-border">
          <Image
            src={DEFAULT_AVATAR_URL}
            alt="Default Avatar"
            width={30}
            height={30}
            className="rounded-full animate-pulse object-cover border-2 border-stone-400"
            priority
          />
        </div>
        <span className="px-3 py-1 bg-muted rounded-md text-ellipsis overflow-hidden">
          Loading...
        </span>
      </div>
    );
  }

  const username = profile && profile?.username || 'Unknown User';
  const avatarUrl = profile && profile?.avatar_url || DEFAULT_AVATAR_URL;

  return (
    <div className="flex items-center gap-2 sm:gap-4 text-md font-semibold text-foreground">
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">
            <Image
              src={avatarUrl}
              alt={`${username}'s avatar`}
              width={28}
              height={28}
              className="rounded-full object-cover border-2 border-text-secondary sm:w-9 sm:h-9"
              priority
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="z-10000 w-84 px-6 pt-6 pb-4 bg-brand-primary text-text-primary border border-text-secondary rounded-xl shadow-lg"
          side="bottom"
          sideOffset={36}
          align="start"
        >
          <div className="flex gap-3 items-center">
            <Image
              src={avatarUrl}
              alt={`${username}'s avatar`}
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-text-secondary"
              priority
            />
            <div className="flex flex-col">
              <div className="text-text-primary flex flex-row flex-wrap items-center gap-2">
                <div className="mt-0.5 font-semibold">{username}</div>
              </div>
            </div>
          </div>
          <Separator className="my-4 opacity-50" />
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-1.5 py-2 px-2 rounded-xl text-[16px] font-medium transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
            >
              <LucideAppWindow className="mr-1 text-xl" />
              Dashboard
            </Link>
            <form action={signOutAction} className="w-full">
              <button
                type="submit"
                className="w-full text-left text-base font-medium rounded-xl flex items-center justify-start gap-1.5 py-2 px-2 transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
              >
                <FaSignOutAlt className="mr-2 text-xl" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProfileButtonServer;