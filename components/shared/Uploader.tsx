'use client';

import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import ImageEditor from '@uppy/image-editor';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import '@uppy/image-editor/css/style.min.css';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { showCustomToast } from './CustomToast';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FaImage } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

interface Props {
  type: 'standard' | 'modal';
  onUpload: (path: string | null) => void;
  bucketName: string;
  folderPath: string;
  userId?: string;
  contentType?: string;
  previewType?: 'image' | 'video';
  fileAttached: string | null;
  uppyId?: string;
}

export default function Uploader({
  type,
  onUpload,
  bucketName,
  folderPath,
  userId,
  previewType = 'image',
  contentType,
  fileAttached,
  uppyId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Ensure fileAttached is unique per uploader instance
  const [localFileAttached, setLocalFileAttached] = useState<string | null>(fileAttached || null);
  // Sync with prop if it changes
  useEffect(() => {
    setLocalFileAttached(fileAttached || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileAttached, uppyId]);

  const uppy = useMemo(() => {
    const u = new Uppy({
      id: uppyId || `uppy-${Math.random().toString(36).substring(2, 10)}`,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*', 'video/*'],
        maxFileSize: 15 * 1024 * 1024,
      },
      autoProceed: false,
    });

    if (contentType === 'profiles') {
      u.use(ImageEditor, {
        id: 'ImageEditor',
        actions: { zoomIn: true, zoomOut: true, cropSquare: false, cropWidescreen: false, cropWidescreenVertical: false },
        cropperOptions: { aspectRatio: 1, viewMode: 1, autoCropArea: 1 }
      });
    }

    u.on('complete', async (res) => {
      const files = res.successful ?? [];
      if (!files.length) return;
      setIsUploading(true);
      const file = files[0];

      if (!file.data) {
        showCustomToast({
          title: 'Upload Error',
          message: 'No file data found. Please try again.',
          variant: 'error',
        });
        setIsUploading(false);
        u.cancelAll();
        return; // Important: Stop the upload process
      }

      const filename = `${file.name?.split('.')[0] ?? 'file'}-${uuidv4()}${file.extension ? `.${file.extension}` : ''
        }`;
      const path = `${folderPath}/${userId ? `${userId}/` : ''}${filename}`;

      try {
        const sb = createClient();
        const { error } = await sb.storage
          .from(bucketName)
          .upload(path, file.data as File, {  // Type assertion here
            upsert: false,
            cacheControl: '3600',
          });

        if (error)
          showCustomToast({ title: 'Upload failed', message: error.message, variant: 'error' });
        else {
          setLocalFileAttached(path);
          onUpload(path);
          showCustomToast({
            title: 'Upload successful',
            message: 'Your file has been uploaded.',
            variant: 'success',
          });
          setOpen(false);
        }
      } catch (e: any) {
        showCustomToast({ title: 'Upload error', message: e.message, variant: 'error' });
      } finally {
        setIsUploading(false);
        u.cancelAll();
      }
    });

    return u;
  }, [bucketName, folderPath, userId, onUpload, contentType]);

  useEffect(() => {
    return () => {
      try {
        uppy.close({ reason: 'unmount' });
        uppy.reset();
        uppy.destroy();
      } catch (e) { }
    };
  }, [uppy]);

  const dashboard = (
    <Dashboard
      key={`dashboard-${uppyId || ''}-${Date.now()}`}
      uppy={uppy}
      hideUploadButton
      proudlyDisplayPoweredByUppy={false}
      showRemoveButtonAfterComplete
      hideProgressDetails={false}
      width="100%"
      height={500}
      {...(contentType === 'profiles'
        ? { plugins: ['ImageEditor'], autoOpen: 'imageEditor' }
        : {})}
      onRequestCloseModal={() => { }}
    />
  );

  if (type === 'standard') return dashboard;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!localFileAttached && (
          <button
            disabled={isUploading}
            className="flex items-center justify-center gap-2 rounded-md bg-bg-primary hover:bg-bg-muted text-text-primary px-4 py-1 text-lg"
          >
            <FaImage />
            {isUploading ? 'Uploading…' : `Select ${previewType}`}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-full bg-brand-secondary text-text-primary xl:max-w-[40vw]">
        <DialogHeader>
          <DialogTitle>Upload {previewType}</DialogTitle>
        </DialogHeader>
        {dashboard}
        <div className="w-full mt-4 flex justify-center">
          <Button
            disabled={isUploading}
            onClick={() => uppy.upload()}
            className="xl:w-1/3 w-full bg-bg-primary hover:bg-bg-muted text-text-primary"
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}