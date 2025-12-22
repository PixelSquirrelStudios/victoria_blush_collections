'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Props {
  filters: {
    name: string;
    value: string;
  }[];
  filterType: string;
  filterTypePlaceholder?: string;
  otherClasses?: string;
  containerClasses?: string;
}

const Filter = ({ filters, filterType, filterTypePlaceholder, otherClasses, containerClasses }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortedOption, setSortedOption] = useState('');

  const paramFilter = filterType === 'sort_by' ? searchParams.get('sort_by') : searchParams.get('page_size');

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: filterType as string,
      value,
    });

    //if params is empty set the select to the placeholder

    if (searchParams.toString() === '') setSortedOption('');

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses} w-full`}>
      <Select
        onValueChange={handleUpdateParams}
        //defaultValue='Sort By'
        value={paramFilter || sortedOption}
      >
        <SelectTrigger
          className={`${otherClasses} body-regular text-md border bg-white px-5 py-2.5 text-gray-700`}
        >
          <div className='line-clamp-1 flex-1 text-left'>
            <SelectValue placeholder={filterTypePlaceholder} />
          </div>
        </SelectTrigger>
        <SelectContent className='text-md bg-white text-gray-700'>
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className='focus:bg-light-800 dark:focus:bg-dark-400 cursor-pointer'
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
