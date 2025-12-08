'use client';

import { usePathname } from 'next/navigation';
import {
  deleteNotification as deleteNotificationAction,
} from '@/lib/actions/notifications.actions';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, Trash } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { showCustomToast } from '../CustomToast';

interface NotificationStatusProps {
  notificationId: string;
  userId: string;
  isRead?: boolean;
  onRead?: () => void;
  onDelete?: () => void;
}

interface NotificationActionProps {
  isRead?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

export const MarkAsRead = ({ isRead, onToggle }: NotificationActionProps) => {
  const handleNotificationStatus = () => {
    if (onToggle) {
      onToggle();
      showCustomToast({
        title: `Notification marked as ${isRead ? 'Unread' : 'Read'}.`,
        variant: 'default',
        autoDismiss: true,
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              onClick={handleNotificationStatus}
              className="h-10 w-10 bg-primary-main p-0"
            >
              {isRead ? <CheckCheck size={20} /> : <Check size={20} />}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="bg-[#111] text-white"
        >
          {isRead ? 'Mark as Unread' : 'Mark as Read'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DeleteNotification = ({
  notificationId,
  userId,
  onDelete,
}: NotificationStatusProps) => {
  const pathname = usePathname();

  const handleDeleteNotification = async () => {
    try {
      // 1. Await the server action first.
      await deleteNotificationAction(notificationId, userId, pathname, true);

      // 2. If it succeeds, call the onDelete prop to update the client state.
      if (onDelete) {
        onDelete();
        showCustomToast({
          title: 'Notification Deleted',
          variant: 'default',
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete Notification:', error);
      showCustomToast({
        title: 'Error',
        message: 'Could not delete Notification.',
        variant: 'error',
        autoDismiss: true,
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              onClick={handleDeleteNotification}
              className="bg-primary-main w-10 h-10 p-0"
            >
              <Trash size={20} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="bg-[#111] text-white"
        >
          Delete
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};