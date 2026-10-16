import type { Metadata } from 'next';
import { cormorant } from '@/app/fonts';
import { fetchUserData } from '@/app/hooks/useUser';
import BookingWidget from '@/components/booking/BookingWidget';
import Footer from '@/components/sections/Footer';
import Maintenance from '@/components/sections/Maintenance';
import { getHomepageData } from '@/lib/actions/homepage.actions';

export const metadata: Metadata = {
  title: 'The Shift Session | Victoria Blush Collections',
  description: 'A private 75-minute 1:1 session for hairdressers, managers and salon owners. Find clarity and a simple plan for your next step.',
};

export default async function ShiftSessionPage() {
  const { data: homepageData } = await getHomepageData();
  const { user } = await fetchUserData();

  if (homepageData?.enable_maintenance && !user) {
    return <Maintenance />;
  }

  return (
    <>
      <main className="min-h-screen pt-[75px] lg:pt-[90px]">
        <section id="shift-session" aria-labelledby="shift-session-heading" className="scroll-mt-28 bg-bg-section pt-4 pb-16 md:pt-6 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <h1 id="shift-session-heading" className={`${cormorant.className} mb-2 text-4xl md:text-5xl font-medium leading-tight`}>
              The Shift Session
            </h1>
            <h2 className={`${cormorant.className} mb-4 text-xl md:text-2xl font-medium leading-snug`}>
              Support for where you are now - and where you want to go next.
            </h2>
            <BookingWidget />
            <div className="mt-10">
              <div className="space-y-4 text-lg leading-8">
                <p>A private 75-minute 1:1 session for hairdressers, managers and salon owners who know something needs to change but don&apos;t know what.</p>
                <p>We&apos;ll talk through what&apos;s really going on, what&apos;s making you feel stuck, what you actually want, and what your next step could look like.</p>
                <p>You&apos;ll leave with more clarity and a simple plan rather than another head full of thoughts.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer description={homepageData?.footer_description} />
    </>
  );
}
