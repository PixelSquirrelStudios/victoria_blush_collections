import { fetchUserData } from '@/app/hooks/useUser';
import GalleryImageCard from '@/components/cards/GalleryImageCard';
import GalleryImageCardList from '@/components/cards/GalleryImageCardList';
import GalleryImageCardListAdmin from '@/components/cards/GalleryImageCardListAdmin';
import NoResults from '@/components/shared/SearchAndFilters/NoResults';
import Pagination from '@/components/shared/SearchAndFilters/Pagination';
import SearchAndFilters from '@/components/shared/SearchAndFilters/SearchAndFilters';
import { getAllImageCategories, getAllGalleryImages } from '@/lib/actions/image.actions';
import { SearchParamsProps } from '@/types';
import { Suspense } from 'react';
import { FaImages } from 'react-icons/fa';

const AllGalleryImages = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;

  const userData = await fetchUserData();
  const profile = userData?.profile;

  // Fetch all categories
  const { data: categories } = await getAllImageCategories();

  const categoryFilters =
    categories?.map((category: any) => ({
      value: category.id,
      label: category.name,
    })) || [];

  // Fetch Images using the search parameters, including selected categories
  const imagesResponse = await getAllGalleryImages({
    searchQuery: searchParams.search,
    sort_by: searchParams.sort_by,
    categories: searchParams.categories,
    list_type: searchParams.list_type,
    page: Number(searchParams.page) || 1,
    page_size: Number(searchParams.page_size) || 12,
  });

  const {
    data: images,
    pageCount,
    isNext = false,
    totalImages = 0,
  } = imagesResponse;

  console.log('Images Response:', imagesResponse);

  const currentPage = searchParams?.page ? +searchParams.page : 1;
  const pageSize = Number(searchParams.page_size) || 12;
  const listType = searchParams?.list_type || 'list';

  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(startRange + (images?.length ?? 0) - 1, totalImages ?? 0);

  const showPagination = (images ?? []).length > 0;

  return (
    <>
      <div className='w-full mb-14 flex flex-col gap-10 md:mb-2'>
        <div>
          <div className='flex flex-col justify-center gap-2 rounded-lg bg-brand-secondary md:px-10 px-4 md:pt-10 pt-6 pb-8'>
            <SearchAndFilters
              currentUser={profile}
              contentIcon={<FaImages />}
              contentTitle='Gallery Images'
              contentButtonTitle='A Gallery Image'
              contentUrl='/dashboard/gallery-images/add-gallery-image'
              route='/dashboard/gallery-images'
              iconPosition='right'
              searchPlaceholder='Search Images...'
              hasFirstFilter={true}
              firstFilterType='categories'
              firstFilters={categoryFilters}
              firstFilterPlaceholder='Filter by Categories'
              sortType='images'
              otherClasses='flex-1'
              hasButton={false}
              hasAdminButton={true}
              reorderUrl='/dashboard/gallery-images/reorder'
              showResultsCounter={totalImages > 0}
              hasCheckboxFilter={true}
              checkboxFilterType='images'
              startRange={startRange}
              endRange={endRange}
              totalResults={totalImages}
            />
            <div>
              <Suspense fallback={
                listType === 'list' ? (
                  <div className='w-full grid xl:grid-cols-2 grid-cols-1 gap-4 pt-6'>
                    {Array.from({ length: pageSize }, (_, i) => (
                      <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-gray-300" />
                    ))}
                  </div>
                ) : (
                  <div className='grid w-full grid-cols-1 gap-x-6 gap-y-6 px-0 pt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                    {Array.from({ length: pageSize }, (_, i) => (
                      <div key={i} className="h-96 w-full animate-pulse rounded-lg bg-gray-300" />
                    ))}
                  </div>
                )
              }>
                {images && images.length > 0 ? (
                  listType === 'list' ? (
                    <div className='w-full grid xl:grid-cols-2 grid-cols-1 gap-4 pt-6'>
                      {images?.map((image: any) => (
                        <GalleryImageCardListAdmin
                          id={image.id}
                          key={image.id}
                          image_url={image.image_url}
                          title={image.title}
                          categories={image.categories_images?.map((ci: any) => ci.categories).filter(Boolean) || []}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='grid w-full grid-cols-1 gap-x-6 gap-y-6 px-0 pt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'>
                      {images?.map((image: any) => (
                        <GalleryImageCard
                          id={image.id}
                          key={image.id}
                          image_url={image.image_url}
                          title={image.title}
                          description={image.description}
                          categories={image.categories_images?.map((ci: any) => ci.categories).filter(Boolean) || []}
                          isAdmin
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className='flex justify-center items-center pt-6'>
                    <NoResults />
                  </div>
                )}
              </Suspense>
            </div>
            {showPagination && (
              <>
                <div className='mt-6 mb-0 hidden md:flex'>
                  <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    totalPages={pageCount || 0}
                    maxButtons={7}
                    isNext={isNext}
                  />
                </div>
                <div className='mt-6 mb-0 flex md:hidden'>
                  <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    totalPages={pageCount || 0}
                    maxButtons={5}
                    isNext={isNext}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllGalleryImages;
