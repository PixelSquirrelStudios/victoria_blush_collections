import { fetchUserData } from '@/app/hooks/useUser';
import PriceListCard from '@/components/cards/ServiceCard';
import PriceListCardListAdmin from '@/components/cards/ServiceCardListAdmin';
import NoResults from '@/components/shared/SearchAndFilters/NoResults';
import Pagination from '@/components/shared/SearchAndFilters/Pagination';
import SearchAndFilters from '@/components/shared/SearchAndFilters/SearchAndFilters';
import PriceListCardSkeleton from '@/components/skeletons/PriceListCardSkeleton';
import { getAllServiceCategories, getAllServices } from '@/lib/actions/service.actions';
import { SearchParamsProps } from '@/types';
import { Suspense } from 'react';
import { FaListAlt } from 'react-icons/fa';

const AllServices = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;

  const userData = await fetchUserData();
  const profile = userData?.profile;

  // Fetch all categories
  const { data: categories } = await getAllServiceCategories();

  const categoryFilters =
    categories?.map((category: any) => ({
      value: category.id,
      label: category.name,
    })) || [];

  // Fetch News using the userId and search parameters, including selected categories
  const servicesResponse = await getAllServices({
    searchQuery: searchParams.search,
    sort_by: searchParams.sort_by,
    categories: searchParams.categories,
    list_type: searchParams.list_type,
    is_highlighted: searchParams.is_highlighted,
    page: Number(searchParams.page) || 1,
    page_size: Number(searchParams.page_size) || 12,
  });

  const {
    data: services,
    pageCount,
    isNext = false,
    totalServices = 0,
  } = servicesResponse;

  console.log('Services Response:', servicesResponse);

  const currentPage = searchParams?.page ? +searchParams.page : 1;
  const pageSize = Number(searchParams.page_size) || 12;
  const listType = searchParams?.list_type || 'list';

  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(startRange + (services?.length ?? 0) - 1, totalServices ?? 0);

  const showPagination = (services ?? []).length > 0;
  return (
    <>
      <div className='w-full mb-14 flex flex-col gap-10 md:mb-2'>
        <div>
          <div className='flex flex-col justify-center gap-2 rounded-lg bg-brand-secondary md:px-10 px-4 md:pt-10 pt-6 pb-8'>
            <SearchAndFilters
              currentUser={profile}
              contentIcon={<FaListAlt />}
              contentTitle='Services'
              contentButtonTitle='A Service'
              contentUrl='/dashboard/services/add-service'
              route='/dashboard/services'
              iconPosition='right'
              searchPlaceholder='Search Services...'
              hasFirstFilter={true}
              firstFilterType='categories'
              firstFilters={categoryFilters}
              firstFilterPlaceholder='Filter by Categories'
              sortType='services'
              otherClasses='flex-1'
              hasButton={false}
              hasAdminButton={true}
              reorderUrl='/dashboard/services/reorder'
              showResultsCounter={totalServices > 0}
              hasCheckboxFilter={true}
              checkboxFilterType='services'
              startRange={startRange}
              endRange={endRange}
              totalResults={totalServices}
            />
            <div>
              <Suspense fallback={
                <div className='grid w-full grid-cols-1 gap-x-6 gap-y-6 px-0 pt-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                  {Array.from({ length: pageSize }, (_, i) => (
                    <PriceListCardSkeleton key={i} />
                  ))}
                </div>
              }>
                {services && services.length > 0 ? (
                  listType === 'list' ? (
                    <div className='w-full grid xl:grid-cols-2 grid-cols-1 gap-4 pt-6'>
                      {services?.map((service: any) => (
                        <PriceListCardListAdmin
                          id={service.id}
                          key={service.id}
                          icon={service.icon}
                          title={service.title}
                          price={service.price}
                          categories={service.categories_services?.map((cs: any) => cs.categories).filter(Boolean) || []}
                          highlight={service.is_highlighted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='grid w-full grid-cols-1 gap-x-6 gap-y-6 px-0 pt-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                      {services?.map((service: any) => (
                        <div className='mb-6 border-b-2 border-white/5 pt-4 last:mb-0 last:border-b-0' key={service.id}>
                          <PriceListCard
                            id={service.id}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            price={service.price}
                            categories={service.categories_services?.map((cs: any) => cs.categories).filter(Boolean) || []}
                            highlight={service.is_highlighted}
                            isAdmin />
                        </div>
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

export default AllServices;