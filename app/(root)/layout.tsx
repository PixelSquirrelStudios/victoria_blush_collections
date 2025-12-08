import '../globals.css';
import React, { Suspense } from 'react';
import { AudioProvider } from '@/app/providers/AudioProvider';
import Header from '@/components/shared/Header';
import { Metadata } from 'next';
import { fetchUserData } from '../hooks/useUser';
import LoadingOverlay from '../providers/LoadingOverlay';

export const metadata: Metadata = {
  title: 'Victoria Blush Collections',
  description: 'Professional hair stylist portfolio showcasing creative styles, transformations, and exceptional hair artistry. Book your appointment today!',
};

// move user fetch into an async child so Suspense can handle it
async function UserWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchUserData();
  const userId = user?.profile?.id;
  return (
    <div className="w-full h-full">
      <AudioProvider userId={userId}>
        <Header mobileVariant="main" isHome={true} />
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
