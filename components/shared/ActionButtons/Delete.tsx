'use client';

import { useRef, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { deleteService } from '@/lib/actions/service.actions';
import { deleteGalleryImage } from '@/lib/actions/image.actions';

import { FaTrash } from 'react-icons/fa';
import { Button } from '../../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog';
import { showCustomToast } from '../CustomToast';
import { Trash2 } from 'lucide-react';

export const Delete = ({
  title,
  variant,
  description = 'This action cannot be undone.',
  trigger,
  confirmationTitle,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting...',
  disabled = false,
  onConfirm,
}: {
  title: string;
  variant: string;
  description?: string;
  trigger?: ReactElement;
  confirmationTitle?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  disabled?: boolean;
  onConfirm: () => Promise<boolean | void>;
}) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const operationLock = useRef(false);
  const blocked = disabled || pending;

  async function confirm() {
    if (blocked || operationLock.current) return;
    operationLock.current = true;
    setPending(true);
    try {
      if (await onConfirm() !== false) setOpen(false);
    } catch (error) {
      showCustomToast({ title: 'Error', message: error instanceof Error ? error.message : 'Unable to complete this action. Please try again.', variant: 'error' });
    } finally {
      operationLock.current = false;
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => { if (!blocked) setOpen(nextOpen); }}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : variant === 'large' ? (
        <AlertDialogTrigger asChild>
          <Button type="button" disabled={blocked} className='w-full h-auto rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors duration-300'>
            <div className='flex flex-row items-center gap-2'>
              <div>
                <Trash2 className='' />
              </div>
              <div className='text-md'>Delete</div>
            </div>
          </Button>
        </AlertDialogTrigger>
      ) : variant === 'admin' ? (
        <AlertDialogTrigger asChild>
          <Button type="button" disabled={blocked} title="Delete" aria-label={`Delete ${title}`} className="h-auto rounded bg-red-500/10 px-2.5 py-1.5 text-red-600 transition-colors duration-300 hover:bg-red-500/20 hover:text-red-700">
            <Trash2 className="size-5" />
          </Button>
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button type="button" disabled={blocked} aria-label={`Delete ${title}`} className='bg-transparent p-0 text-white hover:bg-transparent'>
            <FaTrash className='text-md' />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className='gap-6 rounded-lg border-[#b9c8ad] bg-[#e1e9d9] p-6 text-zinc-900 shadow-xl sm:p-8'>
        <AlertDialogHeader className='gap-4 text-left'>
          <AlertDialogTitle className='min-w-0 text-xl font-medium leading-snug tracking-normal wrap-break-word'>
            {confirmationTitle || `Are you sure you want to delete this ${title}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className='rounded border border-[#c5d2bb] border-l-4 border-l-[#839a6f] bg-[#eef3e8] px-4 py-3 text-sm leading-relaxed text-zinc-700 wrap-break-word'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-3 border-t border-[#c5d2bb] pt-5'>
          <AlertDialogCancel disabled={blocked} className='box-border h-11 min-h-11 rounded border border-zinc-300 bg-white px-6 py-0 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-700'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={blocked}
            className='box-border h-11 min-h-11 rounded border border-transparent bg-red-700 px-6 py-0 text-white transition-colors hover:bg-red-800'
            onClick={(event) => { event.preventDefault(); void confirm(); }}
          >
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const DeleteService = ({
  serviceId,
  variant,
  onDelete,
}: {
  serviceId: any;
  variant: string;
  onDelete?: (id: string) => void;
}) => {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteService({ serviceId });
      showCustomToast({
        title: 'Service Deleted',
        message: 'Service deleted successfully',
        variant: 'success',
        autoDismiss: true,
      });
      if (onDelete) {
        onDelete(serviceId);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting Service', error);
      return false;
    }
  };

  return <Delete title="Service" variant={variant} onConfirm={handleDelete} />;
};

export const DeleteGalleryImage = ({
  imageId,
  variant,
  onDelete,
}: {
  imageId: any;
  variant: string;
  onDelete?: (id: string) => void;
}) => {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteGalleryImage({ imageId });
      showCustomToast({
        title: 'Image Deleted',
        message: 'Gallery image deleted successfully',
        variant: 'success',
        autoDismiss: true,
      });
      if (onDelete) {
        onDelete(imageId);
      } else {
        router.refresh();
      }
    } catch (error) {
      // Handle error
      console.error('Error deleting Gallery Image', error);
      return false;
    }
  };

  return <Delete title="Gallery Image" variant={variant} onConfirm={handleDelete} />;
};