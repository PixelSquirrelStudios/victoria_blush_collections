'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { GalleryImageSchema } from '@/lib/validations';
import { createGalleryImage, editGalleryImage, getAllImageCategories, getImageCategories } from '@/lib/actions/image.actions';

import { showCustomToast } from '@/components/shared/CustomToast';
import { supabaseClient } from '@/lib/supabase/browserClient';
import Uploader from '../shared/Uploader';
import { createCategory } from '@/lib/actions/category.actions';
import { FaTrash } from 'react-icons/fa';

const CreatableSelect = dynamic(() => import('react-select/creatable'), {
  ssr: false,
});

interface Props {
  type?: 'Create' | 'Edit';
  currentUser: any;
  imageDetails?: any; // JSON string
}

const AddGalleryImageForm = ({ type, currentUser, imageDetails }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const parsedImageDetails =
    imageDetails && JSON.parse(imageDetails || '');
  const imageId = parsedImageDetails?.id;

  // Image preview URL
  const [imageUrl, setImageUrl] = useState<string>(
    parsedImageDetails?.image_url || ''
  );

  // Categories state
  const [existingCategories, setExistingCategories] = useState<
    { value: string; label: string; }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    { value: string; label: string; }[]
  >([]);
  const [defaultCategories] = useState<{ value: string; label: string; }[]>(
    parsedImageDetails?.categories_images?.map((link: any) => ({
      value: link.categories.id,
      label: link.categories.name,
    })) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof GalleryImageSchema>>({
    resolver: zodResolver(GalleryImageSchema),
    defaultValues: {
      image_url: parsedImageDetails?.image_url || '',
      title: parsedImageDetails?.title || '',
      description: parsedImageDetails?.description || '',
      categories:
        (parsedImageDetails?.categories?.length
          ? parsedImageDetails.categories
          : defaultCategories?.map((c) => c.value)) || [],
    },
  });

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const { data, error } = await getAllImageCategories();
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        const list =
          data?.map((c: any) => ({ value: c.id, label: c.name })) || [];
        setExistingCategories(list);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    const fetchSelected = async () => {
      if (type === 'Edit' && imageId) {
        const { data, error } = await getImageCategories(imageId);
        if (error) {
          console.error('Error fetching selected categories:', error);
          return;
        }
        const selectedList =
          data?.map((category: any) => ({
            value: category.id,
            label: category.name,
          })) || [];
        setSelectedCategories(selectedList);
        form.setValue(
          'categories',
          selectedList.map((c: any) => c.value)
        );
      } else if (defaultCategories?.length) {
        setSelectedCategories(defaultCategories);
      }
    };
    fetchSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, imageId]);

  const handleCategoriesChange = (
    values: { value: string; label: string; }[]
  ) => {
    setSelectedCategories(values);
    form.setValue(
      'categories',
      values.map((v) => v.value)
    );
  };

  const handleCreateOption = async (name: string) => {
    try {
      const { data: newCategory, error } = await createCategory({
        name,
        type: 'image',
      });
      if (error) throw new Error(error.message);

      const option = { value: newCategory.id, label: newCategory.name };
      setExistingCategories((prev) => [...prev, option]);
      setSelectedCategories((prev) => [...prev, option]);
      form.setValue('categories', [
        ...form.getValues('categories'),
        newCategory.id,
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Image upload success handler (stores full public URL)
  const onImageUpload = (filePath: string | null) => {
    const fullUrl = filePath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`
      : '';
    setImageUrl(fullUrl);
    form.setValue('image_url', fullUrl);
  };

  // Remove image from storage and clear
  const handleRemoveImage = async () => {
    if (!imageUrl) return;
    const relativePath = decodeURIComponent(
      imageUrl.replace(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`,
        ''
      )
    );

    const supabase = supabaseClient;
    const { error } = await supabase.storage
      .from('images')
      .remove([relativePath]);

    if (error) {
      showCustomToast({
        title: 'Error',
        message: 'Could not delete image from storage.',
        variant: 'error',
        autoDismiss: true,
      });
      return;
    }

    setImageUrl('');
    form.setValue('image_url', '');
    showCustomToast({
      title: 'Success',
      message: 'Image removed successfully.',
      variant: 'success',
      autoDismiss: true,
    });
  };

  async function onSubmit(values: z.infer<typeof GalleryImageSchema>) {
    setIsSubmitting(true);
    try {
      const categoryNamesOrIds = selectedCategories.map(
        (c) => c.label || c.value
      );

      if (type === 'Edit') {
        await editGalleryImage({
          imageId: parsedImageDetails.id,
          image_url: values.image_url,
          title: values.title,
          description: values.description || '',
          categories: categoryNamesOrIds,
          path: pathname,
        });
        router.push('/dashboard/gallery-images/');
      } else {
        await createGalleryImage({
          image_url: values.image_url,
          title: values.title,
          description: values.description || '',
          categories: categoryNamesOrIds,
          path: pathname,
        });
        router.push('/dashboard/gallery-images');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <div className="flex w-full flex-col items-start gap-10 bg-brand-secondary p-10 text-text-primary rounded-xl shadow-md">
        <div className="flex flex-row items-center gap-2 pb-2">
          <h1 className="text-2xl text-text-primary font-semibold">
            {type === 'Edit' ? 'Edit Gallery Image' : 'Add Gallery Image'}
          </h1>
          {type === 'Edit' ? (
            <Link href='/dashboard/gallery-images'>
              <div className="text-md flex rounded-full bg-brand-primary px-6 py-1.5 font-medium text-text-primary hover:bg-brand-primary/90 lg:ml-3">
                Cancel Editing
              </div>
            </Link>
          ) : (
            <Link href="/dashboard/gallery-images">
              <div className="text-md flex rounded-full bg-brand-primary px-6 py-1.5 font-medium text-text-primary hover:bg-brand-primary/90 lg:ml-3">
                Cancel
              </div>
            </Link>
          )}
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full w-full flex-col gap-10"
        >
          {/* Image via Uploader */}
          <FormField
            control={form.control}
            name="image_url"
            render={() => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Image<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <div>
                    {imageUrl ? (
                      <>
                        <div className='flex flex-row  items-center gap-4 w-full h-auto'>
                          <Image
                            src={imageUrl}
                            alt="Gallery Image"
                            width={400}
                            height={300}
                            className="h-auto max-h-[300px] w-auto max-w-full bg-[#222] object-contain"
                          />
                          <button
                            type="button"
                            className="mt-4 flex w-auto h-auto justify-center rounded-md bg-red-500 px-3 py-1.5 text-lg text-white transition-all duration-500 hover:bg-red-500/85"
                            onClick={handleRemoveImage}
                          >
                            <div className="flex flex-row items-center gap-1">
                              <div>
                                <FaTrash className="inline mr-2 text-lg" />
                              </div>
                              <div>
                                Remove Image
                              </div>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <Uploader
                        type="modal"
                        userId={currentUser.user_id}
                        contentType="gallery-image"
                        onUpload={onImageUpload}
                        previewType="image"
                        bucketName="images"
                        folderPath="gallery"
                        fileAttached={form.watch('image_url') || null}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories */}
          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Categories<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormDescription className='text-text-primary/80'>
                  Select Categories from the dropdown or start typing and press Enter to add a new one.
                </FormDescription>
                <FormControl className="mt-3.5">
                  <CreatableSelect
                    name="categories"
                    options={existingCategories}
                    defaultValue={type === 'Edit' ? defaultCategories : []}
                    value={selectedCategories}
                    placeholder="Select Categories..."
                    onChange={(opt) =>
                      handleCategoriesChange(
                        (opt as { value: string; label: string; }[]) || []
                      )
                    }
                    onCreateOption={handleCreateOption}
                    isClearable
                    isMulti
                    classNamePrefix="select"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Title<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Input
                    className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder="Enter the image title..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Description (textarea) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Description (Optional)
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Textarea
                    className="min-h-[140px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder="Enter an image description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand-primary hover:bg-brand-primary/90"
          >
            {isSubmitting ? 'Submitting' : 'Submit'}
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default AddGalleryImageForm;
