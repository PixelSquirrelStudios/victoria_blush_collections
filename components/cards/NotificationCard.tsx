import { deleteNotification } from '@/lib/actions/notifications.actions';
import { usePathname } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { FaComments, FaHeart } from 'react-icons/fa6';
import moment from 'moment';
import { DeleteNotification, MarkAsRead } from '../shared/ActionButtons/NotificationActions';

interface NotificationCardProps {
  notification: any;
  userId: string;
  isSelected?: boolean;
  onSelect?: (isSelected: boolean) => void;
  onRead?: (id: string) => void;
  onUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: () => Promise<void>;
  hasCheckbox?: boolean;
  revalidate?: boolean;
}

const NotificationCard = ({
  notification,
  userId,
  isSelected = false,
  onSelect,
  onRead,
  onUnread,
  onDelete,
  onToggleStatus,
  hasCheckbox = true,
  revalidate = true,
}: NotificationCardProps) => {
  const pathname = usePathname();

  const handleSelect = (checked: boolean) => {
    if (onSelect) {
      onSelect(checked);
    }
  };

  const handleToggleStatus = async () => {
    if (onToggleStatus) {
      await onToggleStatus();
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id, userId, pathname, revalidate);
    if (onDelete) onDelete(notification.id);
  };

  return (
    <div className='not-last:mb-6 border-b-2 border-white/5 pt-1 last:mb-0 last:border-b-0'>
      <div className='text-md pb-6 text-white'>
        <div className='flex flex-col items-start gap-2 2xl:flex-row 2xl:items-start 2xl:justify-between'>
          <div className='flex flex-col items-start gap-4 xl:gap-2 2xl:flex-row 2xl:items-center'>
            <div>
              <div className='flex flex-row items-center justify-center gap-4 2xl:gap-2'>
                {hasCheckbox && (
                  <div className='2xl:mr-2'>
                    <Checkbox
                      key={`notification-${notification?.id}`}
                      id={`notification-${notification?.id}`}
                      checked={isSelected}
                      onCheckedChange={handleSelect}
                    />
                  </div>
                )}
                <div className="h-10 w-10 bg-cover bg-center object-cover overflow-hidden">
                  {notification.notification_type.includes('favourite') ? (
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden border-2 border-primary-main">
                      <FaHeart className="text-xl text-primary-main" />
                    </div>
                  ) : (<div className="flex h-10 w-10 items-center justify-center overflow-hidden border-2 border-primary-main">
                    <FaComments className="text-xl text-primary-main" />
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-row items-center justify-end gap-3 max-xl:py-4'>
            <div className='mr-6 text-nowrap text-sm text-white'>
              {moment.min(moment(notification.created_at), moment()).fromNow()}
            </div>
            <MarkAsRead
              isRead={notification.is_read}
              onToggle={handleToggleStatus}
            />
            <DeleteNotification
              notificationId={notification.id}
              userId={userId}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default NotificationCard