import '../globals.css';
import React, { Suspense } from 'react';
import { AudioProvider } from '@/app/providers/AudioProvider';
import Header from '@/components/shared/Menus/Header';
import { Metadata } from 'next';
import { fetchUserData } from '../hooks/useUser';
import LoadingOverlay from '../providers/LoadingOverlay';
import HashScrollHandler from '@/components/shared/HashScrollHandler';

export const metadata: Metadata = {
  title: 'Victoria Blush Collections',
  description: 'Professional hair stylist portfolio showcasing creative styles, transformations, and exceptional hair artistry. Book your appointment today!',
};

// move user fetch into an async child so Suspense can handle it
import { getHomepageData } from '@/lib/actions/homepage.actions';

async function UserWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchUserData();
  const userId = user?.profile?.id;
  const { data: homepageData } = await getHomepageData();
  const showHeader = !(homepageData?.enable_maintenance && !user?.user);
  return (
    <div className="w-full h-full">
      <AudioProvider userId={userId}>
        <HashScrollHandler />
        {showHeader && <Header mobileVariant="main" />}
        {children}
      </AudioProvider>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingOverlay />
      <Suspense fallback={<div aria-busy="true"><LoadingOverlay /></div>}>
        <UserWrapper>{children}</UserWrapper>
      </Suspense>
    </>
  );
}
