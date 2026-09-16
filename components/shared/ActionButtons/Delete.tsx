'use client';

import { useRef, useState } from 'react';
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
  disabled = false,
  onConfirm,
}: {
  title: string;
  variant: string;
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
      showCustomToast({ title: 'Error', message: error instanceof Error ? error.message : 'Unable to delete. Please try again.', variant: 'error' });
    } finally {
      operationLock.current = false;
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => { if (!blocked) setOpen(nextOpen); }}>
      {variant === 'large' ? (
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
      <AlertDialogContent className='flex flex-col items-center justify-center border-none bg-brand-secondary p-12'>
        <AlertDialogHeader className='text-text-primary'>
          <AlertDialogTitle>
            Are you sure you want to delete this {title}?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-text-primary'>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-row items-center justify-center gap-2'>
          <AlertDialogCancel disabled={blocked} className='border-interactive-hover/50 bg-bg-subtle text-text-primary hover:bg-bg-subtle/80 transition-all duration-300'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={blocked}
            className='bg-red-700 text-white transition-all duration-300 hover:bg-red-600 max-sm:mt-2'
            onClick={(event) => { event.preventDefault(); void confirm(); }}
          >
            {pending ? 'Deleting...' : 'Delete'}
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