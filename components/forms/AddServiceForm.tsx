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

import { ServiceSchema } from '@/lib/validations';
import { createService, editService, getAllServiceCategories, getServiceCategories } from '@/lib/actions/service.actions';

import { showCustomToast } from '@/components/shared/CustomToast';
import { supabaseClient } from '@/lib/supabase/browserClient';
import Uploader from '../shared/Uploader';
import { createCategory } from '@/lib/actions/category.actions';
import { Switch } from '../ui/switch';
import { FaTrash } from 'react-icons/fa';

const CreatableSelect = dynamic(() => import('react-select/creatable'), {
  ssr: false,
});

interface Props {
  type?: 'Create' | 'Edit';
  currentUser: any;
  serviceDetails?: any; // JSON string
}

const AddServiceForm = ({ type, currentUser, serviceDetails }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const parsedServiceDetails =
    serviceDetails && JSON.parse(serviceDetails || '');
  const serviceId = parsedServiceDetails?.id;

  // Icon preview URL
  const [iconUrl, setIconUrl] = useState<string>(
    parsedServiceDetails?.icon || ''
  );

  // Categories state
  const [existingCategories, setExistingCategories] = useState<
    { value: string; label: string; }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    { value: string; label: string; }[]
  >([]);
  const [defaultCategories] = useState<{ value: string; label: string; }[]>(
    parsedServiceDetails?.categories_services?.map((link: any) => ({
      value: link.categories.id,
      label: link.categories.name,
    })) || []
  );

  const handleIsHighlightedChange = (checked: boolean) => {
    form.setValue('is_highlighted', checked); // Update isHighlighted field value in the form
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof ServiceSchema>>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      icon: parsedServiceDetails?.icon || '',
      title: parsedServiceDetails?.title || '',
      description: parsedServiceDetails?.description || '',
      price: parsedServiceDetails?.price || '',
      categories:
        (parsedServiceDetails?.categories?.length
          ? parsedServiceDetails.categories
          : defaultCategories?.map((c) => c.value)) || [],
      is_highlighted: parsedServiceDetails?.is_highlighted || false,
    },
  });

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const { data, error } = await getAllServiceCategories();
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
      if (type === 'Edit' && serviceId) {
        const { data, error } = await getServiceCategories(serviceId);
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
  }, [type, serviceId]);

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
        type: 'service',
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

  // Icon upload success handler (stores full public URL)
  const onIconUpload = (filePath: string | null) => {
    const fullUrl = filePath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`
      : '';
    setIconUrl(fullUrl);
    form.setValue('icon', fullUrl);
  };

  // Remove icon from storage and clear
  const handleRemoveIcon = async () => {
    if (!iconUrl) return;
    const relativePath = decodeURIComponent(
      iconUrl.replace(
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
        message: 'Could not delete icon from storage.',
        variant: 'error',
        autoDismiss: true,
      });
      return;
    }

    setIconUrl('');
    form.setValue('icon', '');
    // Immediately update the DB column to '' as well
    if (type === 'Edit' && serviceId) {
      try {
        await editService({
          serviceId,
          icon: '',
          title: form.getValues('title'),
          description: form.getValues('description'),
          price: form.getValues('price'),
          categories: selectedCategories.map((c) => c.label || c.value),
          is_highlighted: form.getValues('is_highlighted'),
          path: pathname,
        });
      } catch (err) {
        showCustomToast({
          title: 'Warning',
          message: 'Icon removed locally, but failed to update service in database.',
          variant: 'error',
          autoDismiss: true,
        });
      }
    }
    showCustomToast({
      title: 'Success',
      message: 'Icon removed successfully.',
      variant: 'success',
      autoDismiss: true,
    });
  };

  async function onSubmit(values: z.infer<typeof ServiceSchema>) {
    setIsSubmitting(true);
    try {
      const categoryNamesOrIds = selectedCategories.map(
        (c) => c.label || c.value
      );

      if (type === 'Edit') {
        await editService({
          serviceId: parsedServiceDetails.id,
          icon: values.icon,
          title: values.title,
          description: values.description,
          price: values.price,
          categories: categoryNamesOrIds,
          is_highlighted: values.is_highlighted,
          path: pathname,
        });
        router.push('/dashboard/services/');
      } else {
        await createService({
          icon: values.icon,
          title: values.title,
          description: values.description,
          price: values.price,
          categories: categoryNamesOrIds,
          is_highlighted: values.is_highlighted,
          path: pathname,
        });
        router.push('/dashboard/services');
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
        <div className="w-full flex md:flex-row flex-col justify-center items-center gap-4 pb-2">
          <h1 className="text-2xl text-text-primary font-semibold">
            {type === 'Edit' ? 'Edit Service' : 'Add Service'}
          </h1>
          {type === 'Edit' ? (
            <Link href='/dashboard/services'>
              <div className="text-md flex rounded-full bg-brand-primary px-6 py-1.5 font-medium text-text-primary hover:bg-brand-primary/90 lg:ml-3">
                Cancel Editing
              </div>
            </Link>
          ) : (
            <Link href="/dashboard/services">
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
          {/* Icon via Uploader */}
          <FormField
            control={form.control}
            name="icon"
            render={() => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Icon<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <div>
                    {iconUrl ? (
                      <>
                        <div className='flex md:flex-row flex-col items-center gap-4 w-full h-auto'>
                          <Image
                            src={iconUrl}
                            alt="Service Icon"
                            width={200}
                            height={200}
                            className="h-[150px] w-auto rounded-md border border-[#333] bg-[#222] object-contain p-2"
                          />
                          <button
                            type="button"
                            className="mt-4 flex w-auto h-auto justify-center rounded-md bg-red-500 px-3 py-1.5 text-lg text-white transition-all duration-500 hover:bg-red-500/85"
                            onClick={handleRemoveIcon}
                          >
                            <div className="flex flex-row items-center gap-1">
                              <div>
                                <FaTrash className="inline mr-2 text-lg" />
                              </div>
                              <div>
                                Remove Icon
                              </div>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <Uploader
                        type="modal"
                        userId={currentUser.user_id}
                        contentType="service"
                        onUpload={onIconUpload}
                        previewType="image"
                        bucketName="images"
                        folderPath="services/icons"
                        fileAttached={form.watch('icon') || null}
                      />
                    )}
                  </div>
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
                    placeholder="Enter the Service title..."
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
                  Description<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Textarea
                    className="min-h-[140px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder="Enter the Service description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="text-md">
                  Price<span className="ml-1 text-red-900">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Input
                    className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder="Enter the Price or price range..."
                    {...field}
                  />
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
          <FormField
            control={form.control}
            name='is_highlighted'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col'>
                <div className='flex flex-col gap-3'>
                  <div className='flex flex-row items-center gap-3'>
                    <FormControl>
                      <Switch
                        checked={field.value === true ? true : false}
                        onCheckedChange={handleIsHighlightedChange}
                      />
                    </FormControl>
                    <FormLabel className='text-md cursor-pointer'>
                      Is Highlighted?
                    </FormLabel>
                  </div>
                  <FormDescription className='text-text-primary/80'>
                    Should this service be highlighted as Popular in the Price List?
                  </FormDescription>
                </div>
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

export default AddServiceForm;