'use client';

import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { showCustomToast } from './shared/CustomToast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { FaImage, FaVideo } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

interface Props {
  type: 'standard' | 'modal';
  onUpload: (paths: string[]) => void;
  bucketName: string;
  folderPath: string;
  userId?: string;
  previewType?: 'image' | 'video';
  maxImages?: number;
  filesAttached: string[];
}

export default function UploaderMulti({
  type,
  onUpload,
  bucketName,
  folderPath,
  userId,
  previewType = 'image',
  maxImages = 4,
  filesAttached = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uppy = useMemo(() => {
    const u = new Uppy({
      restrictions: {
        maxNumberOfFiles: maxImages,
        allowedFileTypes: [previewType === 'video' ? 'video/*' : 'image/*'],
        maxFileSize: 15 * 1024 * 1024,
      },
      autoProceed: false,
    });

    u.on('complete', async (res) => {
      const files = res.successful ?? [];
      if (!files.length) return;
      setIsUploading(true);

      const sb = createClient();
      const uploaded: string[] = [];

      for (const file of files) {
        if (!file.data) {
          showCustomToast({
            title: 'Upload Error',
            message: `Skipping ${file.name}: No file data found.`,
            variant: 'error',
          });
          continue; // Skip to the next file
        }

        const name = `${file.name?.split('.')[0] ?? 'file'}-${uuidv4()}${file.extension ? `.${file.extension}` : ''
          }`;
        const path = `${folderPath}/${userId ? `${userId}/` : ''}${name}`;

        try {
          const { error } = await sb.storage
            .from(bucketName)
            .upload(path, file.data as File, { upsert: false }); // Type assertion

          if (!error) {
            uploaded.push(path);
          } else {
            showCustomToast({
              title: 'Upload Error',
              message: `Failed to upload ${file.name}: ${error.message}`,
              variant: 'error',
            });
          }
        } catch (e: any) {
          showCustomToast({
            title: 'Upload Error',
            message: `Error uploading ${file.name}: ${e.message}`,
            variant: 'error',
          });
        }
      }

      if (uploaded.length) {
        onUpload(uploaded);
        showCustomToast({
          title: 'Upload successful',
          message: `${uploaded.length} file(s) uploaded.`,
          variant: 'success',
        });
        setOpen(false);
      }
      setIsUploading(false);
      u.cancelAll();
    });

    return u;
  }, [bucketName, folderPath, userId, onUpload, maxImages, previewType]);

  useEffect(() => () => uppy.destroy(), [uppy]);

  const dashboard = (
    <Dashboard
      uppy={uppy}
      hideUploadButton
      proudlyDisplayPoweredByUppy={false}
      showRemoveButtonAfterComplete
      hideProgressDetails={false}
      theme="dark"
      style={{ width: '100%' }}
    />
  );

  if (type === 'standard') return dashboard;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {maxImages > 0 && !isUploading && (
          <button
            disabled={isUploading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-secondary-main px-3 py-1 text-lg"
          >
            {previewType === 'image' ? <FaImage /> : <FaVideo />}
            Upload {previewType === 'image' ? 'Images' : 'Videos'}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-stone-900 text-white xl:w-[40vw]!">
        <DialogHeader>
          <DialogTitle>Upload {previewType}s</DialogTitle>
        </DialogHeader>
        {dashboard}
        <div className="flex justify-center mt-4">
          <Button
            disabled={isUploading}
            onClick={() => uppy.upload()}
            className="bg-primary-main hover:bg-primary-hover text-white"
          >
            {isUploading ? 'Uploading…' : 'Upload Selected Files'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}