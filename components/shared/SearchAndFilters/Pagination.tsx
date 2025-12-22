'use client';

import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { Button } from '../../ui/button'; // Assuming this is the same Button component
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from 'react-icons/md';

interface Props {
  pageNumber: number;
  totalPages: number;
  maxButtons: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, totalPages, maxButtons, isNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(pageNumber);

  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  const handleNavigation = (page: number) => {
    setCurrentPage(page);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'page',
      value: page.toString(),
    });
    console.log(typeof page);
    // Keep original logic:
    if (!isNext) setCurrentPage(page - 1);
    router.push(newUrl, { scroll: false });
  };

  // --- Crucial Part: Determine the heights ---
  // You will need to inspect your rendered buttons to get these values.
  // Inspect a non-current page button to find its height.
  const nonCurrentButtonHeight = '36px'; // Example: Height of smaller buttons

  // Inspect a current page button to find its height.
  const currentButtonHeight = '56px'; // Example: Height of the larger button

  const renderPageButton = (page: number) => (
    // Wrap the button in a container with a fixed height equal to the *larger* button's height
    <div
      key={page}
      className='flex items-center justify-center'
      style={{ height: currentButtonHeight, minWidth: '42px' }} // Use the height of the larger button
    >
      <Button
        onClick={() => handleNavigation(page)}
        className={`
          btn flex items-center justify-center gap-2 transition-all duration-300 bg-interactive-active
          ${currentPage === page
            ? 'px-5 py-6' // Larger padding for the current page
            : 'px-4 py-4 opacity-90 hover:opacity-100'} // Smaller padding for other pages
        `}
      // Remove the min-h here as the container will handle the height
      // Also remove size="sm" as padding controls the size here
      >
        <p
          className={`body-medium text-white transition-all duration-300 ${currentPage === page ? 'font-bold text-lg' : 'text-base'
            }`}
          style={{
            opacity: currentPage === page ? 1 : 0.8,
          }}
        >
          {page}
        </p>
      </Button>
    </div>
  );



  const renderPagination = () => {
    // Keep original logic:
    const range = Math.min(totalPages, maxButtons);
    const start = Math.min(
      Math.max(1, currentPage - Math.floor(range / 2)),
      totalPages - range + 1,
    );
    const end = start + range - 1;

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(renderPageButton(i));
    }

    if (start > 1) {
      pages.unshift(
        <span
          key='ellipsis-start'
          // Keep original classes:
          className='px-1 text-lg tracking-wider text-white flex items-center'
          // Give ellipsis the height of the *smaller* buttons for alignment
          style={{ height: nonCurrentButtonHeight }}
        >
          ...
        </span>,
      );
    }
    if (end < totalPages) {
      pages.push(
        <span
          key='ellipsis-end'
          // Keep original classes:
          className='px-1 text-lg tracking-wider text-white flex items-center'
          // Give ellipsis the height of the *smaller* buttons for alignment
          style={{ height: nonCurrentButtonHeight }}
        >
          ...
        </span>,
      );
    }

    // Wrap the output in a flex container for consistent layout control
    // Align items to the bottom so the smaller buttons align with the bottom of the larger ones
    return (
      <div className='flex items-end justify-center gap-1 md:gap-2'> {/* Changed items-center to items-end */}
        {pages}
      </div>
    );
  };

  // Keep original condition:
  if (!isNext && pageNumber === 1) return null;

  return (
    // Main container: flex-col mobile, flex-row desktop
    <div className='flex w-full flex-col items-center justify-center gap-2 md:flex-row'>
      {/* --- Desktop Layout Structure --- */}
      {/* First (Desktop Only) */}
      {totalPages > maxButtons && pageNumber !== 1 && (
        <div className="hidden md:flex"> {/* Wrapped in div for flex control and consistent alignment */}
          <Button
            onClick={() => handleNavigation(1)}
            className='btn flex min-h-9 items-center justify-center bg-primary-main hover:bg-primary-hover'
            size="icon" // Use size="icon"
          // No fixed height here, rely on size="icon" and min-h
          >
            <p className='body-medium text-white'>
              <MdOutlineKeyboardDoubleArrowLeft className='text-2xl' />
            </p>
          </Button>
        </div>
      )}
      {/* Prev (Desktop Only) */}
      <div className="hidden md:flex"> {/* Wrapped in div for flex control and consistent alignment */}
        <Button
          disabled={pageNumber === 1}
          onClick={() => handleNavigation(pageNumber - 1)}
          className='btn flex min-h-9 items-center justify-center bg-interactive-active hover:bg-interactive-active/90'
          size="sm" // Use size="sm"
        // No fixed height here, rely on size="sm" and min-h
        >
          <p className='body-medium text-white'>Prev</p>
        </Button>
      </div>

      {/* Page Numbers (Rendered for both layouts, position changes) */}
      {renderPagination()}

      {/* Next (Desktop Only) */}
      <div className="hidden md:flex"> {/* Wrapped in div for flex control and consistent alignment */}
        <Button
          disabled={!isNext}
          onClick={() => handleNavigation(pageNumber + 1)}
          className='btn flex min-h-9 items-center justify-center gap-2 bg-interactive-active hover:bg-interactive-active/90'
          size="sm" // Use size="sm"
        // No fixed height here, rely on size="sm" and min-h
        >
          <p className='body-medium text-white'>Next</p>
        </Button>
      </div>
      {/* Last (Desktop Only) */}
      {totalPages > maxButtons && pageNumber !== totalPages && (
        <div className="hidden md:flex"> {/* Wrapped in div for flex control and consistent alignment */}
          <Button
            onClick={() => handleNavigation(totalPages)}
            className='btn flex min-h-[36px] items-center justify-center gap-2 bg-primary-main hover:bg-primary-hover'
            size="icon" // Use size="icon"
          // No fixed height here, rely on size="icon" and min-h
          >
            <p className='body-medium text-white'>
              <MdOutlineKeyboardDoubleArrowRight className='text-2xl' />
            </p>
          </Button>
        </div>
      )}
      {/* --- End Desktop Layout Structure --- */}

      {/* --- Mobile Controls Row (Mobile Only) --- */}
      <div className="flex w-full items-center justify-center gap-2 md:hidden">
        {totalPages > maxButtons && pageNumber !== 1 && (
          <div className="flex items-center"> {/* Wrapped in div for consistent alignment */}
            <Button
              onClick={() => handleNavigation(1)}
              className="btn flex min-h-9 items-center justify-center bg-interactive-active hover:bg-interactive-active/90"
              disabled={false} // Corrected disabled prop
              size="icon" // Use size="icon"
            // No fixed height here, rely on size="icon" and min-h
            >
              <p className="body-medium text-white">
                <MdOutlineKeyboardDoubleArrowLeft className="text-2xl" />
              </p>
            </Button>
          </div>
        )}
        <div className="flex items-center"> {/* Wrapped in div for consistent alignment */}
          <Button
            disabled={pageNumber === 1}
            onClick={() => handleNavigation(pageNumber - 1)}
            className="btn flex min-h-9 items-center justify-center bg-interactive-active hover:bg-interactive-active/90"
            size="sm" // Use size="sm"
          // No fixed height here, rely on size="sm" and min-h
          >
            <p className="body-medium text-white">Prev</p>
          </Button>
        </div>
        <div className="flex items-center"> {/* Wrapped in div for consistent alignment */}
          <Button
            disabled={!isNext}
            onClick={() => handleNavigation(pageNumber + 1)}
            className="btn flex min-h-9 items-center justify-center gap-2 bg-interactive-active hover:bg-interactive-active/90"
            size="sm" // Use size="sm"
          // No fixed height here, rely on size="sm" and min-h
          >
            <p className="body-medium text-white">Next</p>
          </Button>
        </div>
        {totalPages > maxButtons && pageNumber !== totalPages && (
          <div className="flex items-center"> {/* Wrapped in div for consistent alignment */}
            <Button
              onClick={() => handleNavigation(totalPages)}
              className="btn flex min-h-9 items-center justify-center gap-2 bg-interactive-active hover:bg-interactive-active/90"
              disabled={false} // Corrected disabled prop
              size="icon" // Use size="icon"
            // No fixed height here, rely on size="icon" and min-h
            >
              <p className="body-medium text-white">
                <MdOutlineKeyboardDoubleArrowRight className="text-2xl" />
              </p>
            </Button>
          </div>
        )}
      </div>
      {/* --- End Mobile Controls Row --- */}
    </div>
  );
};

export default Pagination;
