import { JSX } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface ContentHeadingProps {
  contentIcon: JSX.Element;
  contentTitle: string;
  contentSubtitle?: string;
  isNotificationsPage?: boolean;
  notificationsCount?: number;
  isLoading?: boolean;
}

const ContentHeading = ({
  contentIcon,
  contentTitle,
  contentSubtitle,
  isNotificationsPage,
  notificationsCount,
  isLoading,
}: ContentHeadingProps) => {
  return (
    <div className='flex items-center gap-2 xl:flex-row flex-col'>
      <div className='flex xl:flex-row flex-col items-center gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <div className='text-3xl text-text-primary xl:text-4xl'>{contentIcon}</div>
          <div className='ml-2 lg:text-3xl text-2xl font-medium text-text-primary'>
            {contentTitle}
          </div>
        </div>
        <div className='text-xl font-medium text-text-primary xl:text-2xl'>
          {contentSubtitle && `- ${contentSubtitle}`}
        </div>
      </div>
      {isNotificationsPage && (
        <div
          className='ml-2 flex items-center justify-center rounded-full border-2 border-white bg-primary-main px-4 py-0 text-xl font-medium text-text-primary min-w-16'
          style={{ minHeight: '2rem' }} // Ensures consistent height
        >
          {isLoading ? (
            <FaSpinner className="animate-spin w-6 h-6" />
          ) : (
            notificationsCount
          )}
        </div>
      )}
    </div>
  );
};

export default ContentHeading;