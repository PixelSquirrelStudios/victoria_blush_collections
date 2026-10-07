import '../../app/globals.css';
import { Suspense } from 'react';
import LoadingOverlay from '../providers/LoadingOverlay';
import Sidebar from '@/components/shared/Menus/Sidebar';
import { fetchUserData } from '../hooks/useUser';
import { bookingIdentity } from '@/lib/booking-server';
import { redirect } from 'next/navigation';
import styles from '@/components/booking/booking.module.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const identity = await bookingIdentity();
  if (!identity.user) redirect('/booking/login');
  if (!identity.admin && !identity.client) redirect('/');
  const user = await fetchUserData();
  //console.log('DashboardLayout user:', user);

  return (
    <>
      <div className={`${!identity.admin ? styles.clientShell : ''} bg-[#f6f8f3] w-full min-h-screen px-3 py-4 md:px-6 xl:pl-[296px] xl:pr-6 xl:py-6`}>
        <Sidebar client={!identity.admin} profile={{ username: user.profile?.username || identity.user.user_metadata?.username, avatar_url: user.profile?.avatar_url }} />
        {identity.admin && <LoadingOverlay />}
        <Suspense fallback={<div aria-busy="true"><LoadingOverlay /></div>}>
          <main className="relative flex h-full w-full flex-col items-start justify-start overflow-hidden bg-background">
            <div className="h-full w-full flex flex-col items-start justify-start">
              {children}
            </div>
          </main>
        </Suspense>
      </div>
    </>
  );
}