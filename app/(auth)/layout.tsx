import '../../app/globals.css';
import { Suspense } from 'react';
import LoadingOverlay from '../providers/LoadingOverlay';
import Header from '@/components/shared/Menus/Header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingOverlay />
      <Header mobileVariant='main' />
      <Suspense fallback={<div aria-busy="true"><LoadingOverlay /></div>}>
        <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background lg:px-24 px-10 pt-24">
          <div className="h-auto w-full flex flex-col items-center justify-center">
            {children}
          </div>
        </main>
      </Suspense>
    </>
  );
}