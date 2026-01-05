import '../../app/globals.css';
import { Suspense } from 'react';
import LoadingOverlay from '../providers/LoadingOverlay';
import Header from '@/components/shared/Menus/Header';
import Sidebar from '@/components/shared/Menus/Sidebar';
import { fetchUserData } from '../hooks/useUser';
import MobileSidebar from '@/components/shared/Menus/MobileSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await fetchUserData();
  //console.log('DashboardLayout user:', user);

  return (
    <>
      <div className='bg-brand-secondary/30 w-full h-full min-h-screen flex justify-center pl-5 pr-5 xl:pl-[400px] xl:pr-[50px] xl:py-10 py-4'>
        <Sidebar user={user} profile={user.profile} />
        <LoadingOverlay />
        <Suspense fallback={<div aria-busy="true"><LoadingOverlay /></div>}>
          <main className="relative flex h-full w-full flex-col items-start justify-start overflow-hidden bg-background">
            <div className="h-full w-full flex flex-col items-start justify-start">
              <MobileSidebar variant="dashboard" />
              {children}
            </div>
          </main>
        </Suspense>
      </div>
    </>
  );
}