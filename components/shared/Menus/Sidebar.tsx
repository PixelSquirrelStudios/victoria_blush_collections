import {
  sideBarLinksDashboard,
  sideBarLinksMain,
} from '@/constants';
import { FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import SidebarMenu from './SidebarMenu';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { signOutAction } from '@/app/(auth)/actions';
import Link from 'next/link';

interface SidebarProps {
  user: any;
  profile: any;
}

const Sidebar = ({ profile }: SidebarProps) => {

  return (
    <div className='z-10000 fixed left-0 top-0 hidden h-screen flex-col xl:justify-start gap-1 overflow-y-auto bg-brand-secondary/40 px-10 py-8 shadow-md shadow-primary-hover xl:flex xl:w-[350px]'>
      <div className='flex w-full flex-row items-center gap-3 text-lg font-medium text-text-primary bg-brand-secondary rounded-full p-1.5'>
        <Image
          src={profile.avatar_url}
          alt="User Avatar"
          width={150}
          height={150}
          className="h-10 w-10 rounded-full object-cover border-2 border-text-secondary"
        />
        <div className='text-sm'>
          {profile.username}
        </div>
      </div>
      <div className='mb-3 mt-5 text-xl font-semibold uppercase text-stone-800'>
        Main Links
      </div>
      <div className='flex w-auto flex-col gap-4 pl-3 text-2xl font-semibold text-stone-800'>
        <SidebarMenu sidebarLinks={sideBarLinksMain} />
      </div>
      <Separator className='opacity-40' />
      <div className='mb-3 mt-5 text-xl font-semibold uppercase text-stone-800'>
        Manage Content
      </div>
      <div className='flex w-auto flex-col gap-4 pl-3 text-2xl font-semibold text-stone-800'>
        <SidebarMenu sidebarLinks={sideBarLinksDashboard} />
      </div>
      <div className='mb-3 mt-6 text-xl font-semibold uppercase text-stone-800'>
        Account
      </div>
      <Link href="/dashboard/edit-profile">
        <button
          className="w-full text-left text-base font-medium rounded-xl flex items-center justify-start gap-1.5 ml-1.5 py-2 px-2 transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
        >
          <FaUserCog className="mr-2 text-2xl" />
          <span className='text-xl pl-1'>Edit Profile</span>
        </button>
      </Link>
      <form action={signOutAction} className="w-full">
        <button
          type="submit"
          className="w-full text-left text-base font-medium rounded-xl flex items-center justify-start gap-1.5 ml-1.5 py-2 px-2 transition-colors duration-200 hover:bg-brand-secondary/60 focus:outline-none focus-visible:ring-0"
        >
          <FaSignOutAlt className="mr-2 text-2xl" />
          <span className='text-xl pl-1'>Sign Out</span>
        </button>
      </form>
    </div>
  );
};
export default Sidebar;
