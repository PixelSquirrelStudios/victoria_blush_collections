import { FaImage, FaImages, FaListAlt, FaUserCog } from 'react-icons/fa';

import Link from 'next/link';

import DashboardCard from '@/components/cards/DashboardCard';
import { fetchUserData } from '@/app/hooks/useUser';

import { getPublicGalleryImages } from '@/lib/actions/image.actions';
import { getPublicServices } from '@/lib/actions/service.actions';
import { IoSwapVerticalOutline } from "react-icons/io5";
import { TbHomeEdit } from 'react-icons/tb';

const DashboardPage = async () => {
  const { user } = await fetchUserData();

  const latestGalleryImages = await getPublicGalleryImages();
  const imageCount = latestGalleryImages?.data?.length || 0;

  const latestServices = await getPublicServices();
  const serviceCount = latestServices?.data?.length || 0;

  return (
    <>
      <div className='py-8 flex h-full items-start justify-start w-full flex-col gap-6'>
        <div className='mb-4 text-6xl text-text-primary font-medium'>Dashboard</div>
        <div className='flex flex-col gap-6 2xl:flex-row w-full'>
          <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3'>
            <DashboardCard
              dashboardCardCount={imageCount}
              dashboardCardIcon={
                <FaImages className='p-6 text-[16em] text-text-primary/90 md:p-8' />
              }
              dashboardCardLabel='Image'
              dashboardCardLabelPlural='Images'
              dashboardCardButtonLink='/dashboard/gallery-images/'
              dashboardCardButtonLabel='Images'
            />
            <DashboardCard
              dashboardCardCount={serviceCount}
              dashboardCardIcon={
                <FaListAlt className='p-6 text-[16em] text-text-primary/90 md:p-8' />
              }
              dashboardCardLabel='Service'
              dashboardCardLabelPlural='Services'
              dashboardCardButtonLink='/dashboard/services/'
              dashboardCardButtonLabel='Services'
            />
            {/* <DashboardCard
              dashboardCardCount={serviceCount}
              dashboardCardIcon={
                <BsFileEarmarkMusicFill className='p-6 text-[16em] text-white/90 md:p-8' />
              }
              dashboardCardLabel='Service'
              dashboardCardLabelPlural='Services'
              dashboardCardButtonLink='/dashboard/services/'
              dashboardCardButtonLabel='Services'
            /> */}
          </div>
        </div>

        <div className='grid w-full grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-2'>
          {/* <div className='h-full min-h-[280px] w-auto rounded-xl bg-brand-secondary bg-opacity-85 p-8 text-gray-700 shadow-md'>
            <div className='mb-4 text-3xl font-bold'>Content Stats</div>
            Stats
          </div> */}
          <div className='flex h-full w-auto flex-col gap-2 rounded-xl bg-brand-secondary bg-opacity-85 p-8 text-gray-700 shadow-md'>
            <div className='mb-4 text-3xl font-bold'>Quick Links</div>
            <div className='grid h-auto grid-cols-2 content-center items-center justify-center gap-x-2 gap-y-8'>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <FaUserCog className='text-2xl text-text-primary' />
                </div>
                <Link href='/dashboard/edit-profile'>
                  <div className='text-xl font-semibold underline'>
                    Edit Profile
                  </div>
                </Link>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <TbHomeEdit className='text-xl text-text-primary' />
                </div>
                <Link href='/dashboard/edit-homepage'>
                  <div className='text-xl font-semibold underline'>
                    Edit Homepage
                  </div>
                </Link>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <FaListAlt className='text-xl text-text-primary' />
                </div>
                <Link href='/dashboard/services/add-service'>
                  <div className='text-xl font-semibold underline'>
                    Add A Service
                  </div>
                </Link>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <IoSwapVerticalOutline className='text-2xl text-text-primary' />
                </div>
                <Link href='/dashboard/services/reorder/'>
                  <div className='text-xl font-semibold underline'>
                    Reorder Services
                  </div>
                </Link>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <FaImage className='text-xl text-text-primary' />
                </div>
                <Link href='/dashboard/gallery-images/add-gallery-image/'>
                  <div className='text-xl font-semibold underline'>
                    Add A Gallery Image
                  </div>
                </Link>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <div className='rounded-full bg-primary-main bg-opacity-85 p-2.5'>
                  <IoSwapVerticalOutline className='text-2xl text-text-primary' />
                </div>
                <Link href='/dashboard/gallery-images/reorder/'>
                  <div className='text-xl font-semibold underline'>
                    Reorder Images
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardPage;
