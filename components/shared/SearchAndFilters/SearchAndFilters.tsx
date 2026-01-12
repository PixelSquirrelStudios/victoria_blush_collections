'use client';

import { cn, formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { FaSearch } from 'react-icons/fa';

import ContentHeading from './ContentHeading';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DummySelect from './DummySelect';
import StylisedButton from '../ActionButtons/StylisedButton';
import { ImageFilters, PageSizeFilters, ServiceFilters, StandardFilters } from '@/constants/filters';
import Filter from './Filter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { customSelectStyles } from '@/constants';
import DynamicRadioGroup, { RadioOption } from './DynamicRadioGroup';

const Select = dynamic(() => import('react-select'), {
  loading: () => <DummySelect />,
  ssr: false,
});

interface SearchAndFilterProps {
  currentUser?: any;
  contentIcon: JSX.Element;
  contentTitle: string;
  contentButtonTitle?: string;
  contentSubtitle?: string;
  isNotificationsPage?: boolean;
  isLoading?: boolean;
  notificationsCount?: number;
  contentUrl: string;
  route: string;
  iconPosition: string;
  searchPlaceholder: string;
  hasFirstFilter?: boolean;
  firstFilterType?: string;
  firstFilters?: any;
  firstFilterPlaceholder?: string;
  hasSecondFilter?: boolean;
  secondFilterType?: string;
  secondFilters?: any;
  secondFilterPlaceholder?: string;
  hasThirdFilter?: boolean;
  thirdFilterType?: string;
  thirdFilters?: any;
  thirdFilterPlaceholder?: string;
  sortType?: string;
  otherClasses?: string;
  hasButton?: boolean;
  hasAdminButton?: boolean;
  reorderUrl?: string;
  accordionFilters?: boolean;
  hasCheckboxFilter?: boolean;
  checkboxFilterType?: string;
  showResultsCounter?: boolean;
  startRange?: number;
  endRange?: number;
  totalResults?: number;
}

const SearchAndFilters = ({
  currentUser,
  contentIcon,
  contentTitle,
  contentButtonTitle,
  contentSubtitle,
  isNotificationsPage,
  isLoading,
  notificationsCount,
  contentUrl,
  route,
  iconPosition,
  searchPlaceholder,
  hasFirstFilter,
  firstFilterType,
  firstFilters,
  firstFilterPlaceholder,
  hasSecondFilter,
  secondFilterType,
  secondFilters,
  secondFilterPlaceholder,
  hasThirdFilter,
  thirdFilterType,
  thirdFilters,
  thirdFilterPlaceholder,
  sortType,
  otherClasses,
  hasButton,
  hasAdminButton,
  reorderUrl,
  accordionFilters = false,
  hasCheckboxFilter,
  checkboxFilterType,
  startRange,
  endRange,
  totalResults,
  showResultsCounter,
}: SearchAndFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('search');

  const [search, setSearch] = useState(query || '');
  const [selectedFirstOption, setSelectedFirstOption] = useState<any[]>([]);
  const [selectedSecondOption, setSelectedSecondOption] = useState<any[]>([]);
  const [selectedThirdOption, setSelectedThirdOption] = useState<any[]>([]);

  const [listType, setListType] = useState(
    searchParams.get('list_type') || 'list'
  );

  const [showHighlighted, setShowHighlighted] = useState(
    searchParams.get('is_highlighted') || 'false'
  );

  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'search',
          value: search,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route && searchParams.has('search')) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ['search'],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, route, pathname, router]);

  useEffect(() => {
    const updateSelectedOptions = (
      filterType: string | undefined,
      filters: any[] | undefined,
      setSelectedState: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
      if (filterType && searchParams.has(filterType) && filters) {
        const selectedValues = searchParams.get(filterType)?.split(',');
        const preSelectedOptions = filters.filter((option: any) =>
          selectedValues?.includes(option.value)
        );
        setSelectedState(preSelectedOptions);
      } else if (filterType && !searchParams.has(filterType)) {
        // If the filter type is no longer in the URL, clear the selected state
        setSelectedState([]);
      }
    };

    updateSelectedOptions(
      firstFilterType,
      firstFilters,
      setSelectedFirstOption
    );
    updateSelectedOptions(
      secondFilterType,
      secondFilters,
      setSelectedSecondOption
    );
    updateSelectedOptions(
      thirdFilterType,
      thirdFilters,
      setSelectedThirdOption
    );

    setListType(searchParams.get('list_type') || 'list');
    setShowHighlighted(searchParams.get('is_highlighted') || 'false');
  }, [
    searchParams,
    firstFilters,
    secondFilters,
    thirdFilters,
    firstFilterType,
    secondFilterType,
    thirdFilterType,
  ]);

  const handleFilterChange = (
    selectedOption: any,
    actionMeta: any,
    filterKey: string,
    setSelectedState: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setSelectedState(selectedOption);

    const params = new URLSearchParams(searchParams.toString());
    const selectedValues =
      selectedOption?.map((option: any) => option.value).join(',') || '';

    if (selectedValues) {
      params.set(filterKey, selectedValues);
    } else {
      params.delete(filterKey);
    }

    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleListTypeChange = async (type: string) => {
    setListType(type);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'list_type',
      value: type,
    });
    router.push(newUrl, { scroll: false });
  };

  const handleShowHighlightedChange = async (value: string) => {
    setShowHighlighted(value);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'is_highlighted',
      value: value,
    });
    router.push(newUrl, { scroll: false });
  };

  const resetFilters = () => {
    const resetUrl = removeKeysFromQuery({
      params: searchParams.toString(),
      keysToRemove: [
        'search',
        firstFilterType as string,
        secondFilterType as string,
        thirdFilterType as string,
        'sort_by',
        'page_size',
        'list_type',
        'is_highlighted',
        'page',
        'pageSize',
      ],
    });

    setSearch('');
    setSelectedFirstOption([]);
    setSelectedSecondOption([]);
    setSelectedThirdOption([]);
    setListType('list');
    setShowHighlighted('false');
    router.push(resetUrl, { scroll: false });
  };

  const listTypeFilterOptions: RadioOption[] = [
    { value: 'list', id: 'list', label: 'List' },
    { value: 'grid', id: 'grid', label: 'Grid' },
  ];

  const highlightedFilterOptions: RadioOption[] = [
    { value: 'false', id: 'false', label: 'Show All' },
    { value: 'true', id: 'true', label: 'Show Highlighted' },
  ];

  return (
    <>
      <div
        className={`flex w-full flex-col items-center justify-items pb-4 2xl:flex-row ${isNotificationsPage ? 'gap-6' : 'max-2xl:gap-4'
          }`}
      >
        <ContentHeading
          contentIcon={contentIcon}
          contentTitle={contentTitle}
          contentSubtitle={contentSubtitle}
          isNotificationsPage={isNotificationsPage}
          isLoading={isLoading}
          notificationsCount={notificationsCount}
        />
        <div className='flex flex-col items-center gap-4 lg:flex-row xl:pl-4'>
          {((currentUser && currentUser.role === 'admin' && hasAdminButton) ||
            hasButton) && (
              <div className='flex gap-2'>
                <Link href={contentUrl}>
                  <button className='flex bg-bg-primary rounded-sm px-4 py-1.5 font-semibold tracking-wider text-black/90 hover:bg-bg-primary/90 transition-all duration-300'>
                    Add {contentButtonTitle}
                  </button>
                </Link>
                {reorderUrl && currentUser && currentUser.role === 'admin' && (
                  <Link href={reorderUrl}>
                    <button className='flex bg-interactive-active rounded-sm px-4 py-1.5 font-semibold tracking-wider text-white hover:bg-interactive-active/90 transition-all duration-300'>
                      Reorder
                    </button>
                  </Link>
                )}
              </div>
            )}
          <div>
            <Button
              className='flex rounded-sm bg-brand-primary px-6 py-4 tracking-wide text-text-primary hover:bg-brand-primary/90'
              onClick={resetFilters}
              disabled={searchParams.toString() === ''}
            >
              Reset Filters
            </Button>
          </div>
          {showResultsCounter && (
            <div className='ml-2 flex justify-end text-text-primary'>
              {totalResults === 1
                ? 'Showing 1 result'
                : `Showing ${startRange}-${endRange} of ${totalResults} results`}
            </div>
          )}
        </div>
      </div>
      <div className='mb-2 flex w-full flex-col justify-between gap-2 2xl:flex-row'>
        <div
          className={`flex max-h-[52px] min-h-[52px] items-center rounded-[10px] bg-white px-4 text-black xl:basis-2/3 ${otherClasses}`}
        >
          <Input
            type='text'
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='placeholder text-md items-center border-none bg-transparent text-black shadow-none outline-hidden focus:border-none focus:outline-hidden'
          />

          {iconPosition === 'right' && (
            <FaSearch className='cursor-pointer text-xl text-gray-600' />
          )}
        </div>
        <div className='mt-2 flex w-full basis-full flex-col gap-4 md:flex-row 2xl:mt-0 2xl:basis-1/3 2xl:pl-2'>
          <Filter
            filters={
              sortType === 'service'
                ? ServiceFilters
                : sortType === 'image'
                  ? ImageFilters
                  : StandardFilters
            }
            filterType='sort_by'
            filterTypePlaceholder='Sort By'
            otherClasses='min-h-[52px] sm:min-w-[220px] bg-white xl:basis-1/5'
          />
          <Filter
            filters={PageSizeFilters}
            filterType='page_size'
            filterTypePlaceholder='Page Size'
            otherClasses='min-h-[52px] sm:min-w-[220px] bg-white xl:basis-1/5'
          />
        </div>
      </div>

      {/* Primary filters always visible on desktop OR when accordionFilters is false */}
      <div className={`${accordionFilters ? 'hidden 2xl:flex' : 'flex'} w-full flex-col gap-2`}>
        <div className='flex w-full flex-col gap-4 2xl:flex-row'>
          {hasFirstFilter && (
            <div className='flex w-full flex-col'>
              <Select
                value={selectedFirstOption}
                onChange={(selectedFirstOption, actionMeta) =>
                  handleFilterChange(
                    selectedFirstOption,
                    actionMeta,
                    firstFilterType as string,
                    setSelectedFirstOption
                  )
                }
                options={firstFilters}
                isMulti
                isOptionDisabled={() => selectedFirstOption.length >= 4}
                placeholder={firstFilterPlaceholder}
                className={`basic-multi-select capitalize text-black ${otherClasses}`}
                classNamePrefix='select'
                styles={customSelectStyles('default')}
              />
            </div>
          )}
          {hasSecondFilter && (
            <div className='flex w-full flex-col'>
              <Select
                value={selectedSecondOption}
                onChange={(selectedSecondOption, actionMeta) =>
                  handleFilterChange(
                    selectedSecondOption,
                    actionMeta,
                    secondFilterType as string,
                    setSelectedSecondOption
                  )
                }
                options={secondFilters}
                isMulti
                isOptionDisabled={() => selectedSecondOption.length >= 3}
                placeholder={secondFilterPlaceholder}
                className={`basic-multi-select capitalize text-black ${otherClasses}`}
                classNamePrefix='select'
                styles={customSelectStyles('default')}
              />
            </div>
          )}
          {hasThirdFilter && (
            <div className='flex w-full flex-col'>
              <Select
                value={selectedThirdOption}
                onChange={(selectedThirdOption, actionMeta) =>
                  handleFilterChange(
                    selectedThirdOption,
                    actionMeta,
                    thirdFilterType as string,
                    setSelectedThirdOption
                  )
                }
                options={thirdFilters}
                isMulti
                isOptionDisabled={() => selectedThirdOption.length >= 4}
                placeholder={thirdFilterPlaceholder}
                className={`basic-multi-select capitalize text-black ${otherClasses}`}
                classNamePrefix='select'
                styles={customSelectStyles('default')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Accordion for all filters on smaller screens - only show if accordionFilters is true */}
      {accordionFilters && (
        <div className='flex w-full flex-col gap-2 2xl:hidden'>
          <Accordion
            type='single'
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value='filters' className='border-none'>
              <AccordionTrigger className='z-10 flex flex-row-reverse items-center justify-end gap-2 rounded-lg border-none bg-stone-800/75 p-4 font-semibold text-white transition-all duration-300 hover:bg-stone-800/80 hover:no-underline'>
                <span className='accordion-closed'>Show Additional Filters</span>
                <span className='accordion-open'>Hide Additional Filters</span>
              </AccordionTrigger>
              <AccordionContent className='accordion-content h-full'>
                <div className='mt-4 flex w-full flex-col gap-4 2xl:flex-row'>
                  {hasFirstFilter && (
                    <div className='flex w-full flex-col'>
                      <Select
                        value={selectedFirstOption}
                        onChange={(selectedFirstOption, actionMeta) =>
                          handleFilterChange(
                            selectedFirstOption,
                            actionMeta,
                            firstFilterType as string,
                            setSelectedFirstOption
                          )
                        }
                        options={firstFilters}
                        isMulti
                        isOptionDisabled={() => selectedFirstOption.length >= 4}
                        placeholder={firstFilterPlaceholder}
                        className={`basic-multi-select select-dropdown capitalize text-black ${otherClasses}`}
                        classNamePrefix='select'
                        styles={customSelectStyles('default')}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        menuPosition='fixed'
                      />
                    </div>
                  )}
                  {hasSecondFilter && (
                    <div className='flex w-full flex-col'>
                      <Select
                        value={selectedSecondOption}
                        onChange={(selectedSecondOption, actionMeta) =>
                          handleFilterChange(
                            selectedSecondOption,
                            actionMeta,
                            secondFilterType as string,
                            setSelectedSecondOption
                          )
                        }
                        options={secondFilters}
                        isMulti
                        isOptionDisabled={() => selectedSecondOption.length >= 3}
                        placeholder={secondFilterPlaceholder}
                        className={`basic-multi-select capitalize text-black ${otherClasses}`}
                        classNamePrefix='select custom-select'
                        styles={customSelectStyles('default')}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        menuPosition='fixed'
                      />
                    </div>
                  )}
                  {hasThirdFilter && (
                    <div className='flex w-full flex-col'>
                      <Select
                        value={selectedThirdOption}
                        onChange={(selectedThirdOption, actionMeta) =>
                          handleFilterChange(
                            selectedThirdOption,
                            actionMeta,
                            thirdFilterType as string,
                            setSelectedThirdOption
                          )
                        }
                        options={thirdFilters}
                        isMulti
                        isOptionDisabled={() => selectedThirdOption.length >= 4}
                        placeholder={thirdFilterPlaceholder}
                        className={`basic-multi-select capitalize text-black ${otherClasses}`}
                        classNamePrefix='select'
                        styles={customSelectStyles('default')}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        menuPosition='fixed'
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {hasCheckboxFilter && (
        <div className='flex 2xl:flex-row flex-col 2xl:items-center 2xl:gap-8 gap-2 mt-4'>
          {hasCheckboxFilter && checkboxFilterType === 'services' && (
            <>
              <DynamicRadioGroup
                title='Filter Listing Type:'
                options={listTypeFilterOptions}
                value={listType}
                onValueChange={handleListTypeChange}
              />
              <DynamicRadioGroup
                title='Filter By Highlighted:'
                options={highlightedFilterOptions}
                value={showHighlighted}
                onValueChange={handleShowHighlightedChange}
              />
            </>
          )}
          {hasCheckboxFilter && checkboxFilterType === 'images' && (
            <>
              <DynamicRadioGroup
                title='Filter Listing Type:'
                options={listTypeFilterOptions}
                value={listType}
                onValueChange={handleListTypeChange}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SearchAndFilters;