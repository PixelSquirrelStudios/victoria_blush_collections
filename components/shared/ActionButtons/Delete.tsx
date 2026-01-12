'use client';

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
      // Handle error
      console.error('Error deleting Service', error);
    }
  };

  return (
    <AlertDialog>
      {variant === 'large' ? (
        <AlertDialogTrigger asChild>
          <Button className='w-full h-auto rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors duration-300'>
            <div className='flex flex-row items-center gap-2'>
              <div>
                <Trash2 className='' />
              </div>
              <div className='text-md'>Delete</div>
            </div>
          </Button>
        </AlertDialogTrigger>
      ) : variant === 'admin' ? (
        <AlertDialogTrigger>
          <div className="flex gap-2">
            <div
              className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors duration-300"
            >
              <Trash2 className="inline text-sm" size={20} />
            </div>
          </div>
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button className='bg-transparent p-0 text-white hover:bg-transparent'>
            <FaTrash className='text-md' />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className='flex flex-col items-center justify-center border-none bg-brand-secondary p-12'>
        <AlertDialogHeader className='text-text-primary'>
          <AlertDialogTitle>
            Are you sure you want to delete this Service?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-text-primary'>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-row items-center justify-center gap-2'>
          <AlertDialogCancel className='border-interactive-hover/50 bg-bg-subtle text-text-primary hover:bg-bg-subtle/80 transition-all duration-300'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-red-700 text-white transition-all duration-300 hover:bg-red-600 max-sm:mt-2'
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
    }
  };

  return (
    <AlertDialog>
      {variant === 'large' ? (
        <AlertDialogTrigger asChild>
          <Button className='w-full h-auto rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors duration-300'>
            <div className='flex flex-row items-center gap-2'>
              <div>
                <Trash2 className='' />
              </div>
              <div className='text-md'>Delete</div>
            </div>
          </Button>
        </AlertDialogTrigger>
      ) : variant === 'admin' ? (
        <AlertDialogTrigger>
          <div className="flex gap-2">
            <div
              className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors duration-300"
            >
              <Trash2 className="inline text-sm" size={20} />
            </div>
          </div>
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button className='bg-transparent p-0 text-white hover:bg-transparent'>
            <FaTrash className='text-md' />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className='flex flex-col items-center justify-center border-none bg-brand-secondary p-12'>
        <AlertDialogHeader className='text-text-primary'>
          <AlertDialogTitle>
            Are you sure you want to delete this Gallery Image?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-text-primary'>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-row items-center justify-center gap-2'>
          <AlertDialogCancel className='border-interactive-hover/50 bg-bg-subtle text-text-primary hover:bg-bg-subtle/80 transition-all duration-300'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-red-700 text-white transition-all duration-300 hover:bg-red-600 max-sm:mt-2'
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};