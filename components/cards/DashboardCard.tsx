import { FaEye } from 'react-icons/fa';
import { DashboardCardProps } from '@/types';
import CustomButton from '../shared/ActionButtons/CustomButton';

const DashboardCard = (dashboardCardProps: DashboardCardProps) => {
  return (
    <div className='rounded-xl bg-brand-secondary p-8 text-text-primary shadow-md'>
      <div className='flex w-full flex-row justify-between'>
        <div className='flex w-full flex-col justify-between'>
          <div className='flex w-full flex-row justify-start md:gap-10 gap-5'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary-hover bg-opacity-75 md:h-[120px] md:w-[120px]'>
              {dashboardCardProps.dashboardCardIcon}
            </div>

            <div>
              <div className='text-6xl font-semibold'>
                {dashboardCardProps.dashboardCardCount}
              </div>
              <div className='text-3xl font-bold'>
                {dashboardCardProps.dashboardCardCount === 1
                  ? dashboardCardProps.dashboardCardLabel
                  : dashboardCardProps.dashboardCardLabelPlural}
              </div>
            </div>
          </div>
          <div className='flex justify-end'>
            <CustomButton
              variant='primary'
              hasLink
              link={dashboardCardProps.dashboardCardButtonLink}
              className='mt-4 flex flex-row items-center justify-end gap-3'
            >
              <FaEye className='text-xl' />
              View All {dashboardCardProps.dashboardCardButtonLabel}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardCard;
