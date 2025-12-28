'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { HomepageSchema } from '@/lib/validations';
import { updateHomepage } from '@/lib/actions/homepage.actions';
import { showCustomToast } from '@/components/shared/CustomToast';
import Uploader from '../shared/Uploader';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Image from 'next/image';

interface Props {
  currentUser: any;
  homepageData?: any;
}

const EditHomepageForm = ({ homepageData, currentUser }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('hero');
  const form = useForm<z.infer<typeof HomepageSchema>>({
    resolver: zodResolver(HomepageSchema),
    defaultValues: {
      hero_image_url: homepageData?.hero_image_url || '',
      hero_subheading: homepageData?.hero_subheading || '',
      hero_description: homepageData?.hero_description || '',
      about_image_url: homepageData?.about_image_url || '',
      about_description: homepageData?.about_description || '',
      services_subheading: homepageData?.services_subheading || '',
      services_description: homepageData?.services_description || '',
      services_important_notice: homepageData?.services_important_notice || '',
      gallery_subheading: homepageData?.gallery_subheading || '',
      gallery_description: homepageData?.gallery_description || '',
      contact_subheading: homepageData?.contact_subheading || '',
      contact_description: homepageData?.contact_description || '',
      contact_address: homepageData?.contact_address || '',
      contact_phone_number: homepageData?.contact_phone_number || '',
      contact_email: homepageData?.contact_email || '',
      opening_hours: homepageData?.opening_hours || [{ label: '', value: '' }],
      contact_social_media_url: homepageData?.contact_social_media_url || '',
      footer_description: homepageData?.footer_description || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'opening_hours',
  });

  async function onSubmit(values: z.infer<typeof HomepageSchema>) {
    setIsSubmitting(true);

    try {
      const result = await updateHomepage(values, '/dashboard/edit-homepage');

      if (result.error) {
        showCustomToast({
          title: 'Error',
          message: result.error,
          variant: 'error',
        });
        return;
      }

      showCustomToast({
        title: 'Success',
        message: 'Homepage updated successfully',
        variant: 'success',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Form submission error:', error);
      showCustomToast({
        title: 'Error',
        message: 'Failed to update homepage',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <div className="flex w-full flex-col items-start gap-10 bg-brand-secondary p-10 text-text-primary rounded-xl shadow-md">
        <div className="flex flex-row items-center gap-2 pb-2">
          <h1 className="text-2xl text-text-primary font-semibold">
            Edit Homepage
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="text-md rounded-full bg-brand-primary px-6 py-1.5 font-medium text-text-primary hover:bg-brand-primary/90 lg:ml-3"
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full w-full flex-col gap-10">
          <Tabs defaultValue="hero" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-brand-primary p-2 mb-4">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>

            {/* Hero Tab */}
            <TabsContent value="hero" className="space-y-6">
              <FormField
                control={form.control}
                name="hero_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">Hero Image</FormLabel>
                    <FormControl>
                      <div>
                        <div className="mb-4">
                          <Image
                            src={
                              field.value
                                ? (field.value.startsWith('http')
                                  ? field.value
                                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${field.value}`)
                                : '/assets/images/placeholder-hero.jpg'
                            }
                            alt="Hero preview"
                            width={400}
                            height={600}
                            className='w-auto max-h-[300px] object-contain'
                            onError={(e) => {
                              e.currentTarget.src = '/assets/images/placeholder-hero.jpg';
                            }}
                            priority
                          />
                        </div>
                        {field.value && (
                          <button
                            type="button"
                            className="mt-4 flex w-auto h-auto justify-center rounded-md bg-red-500 px-3 py-1.5 text-lg text-white transition-all duration-500 hover:bg-red-500/85"
                            onClick={() => field.onChange("")}
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
                        )}
                        {activeTab === 'hero' && (
                          <Uploader
                            key={`hero-uploader-${field.value || ''}`}
                            type="modal"
                            userId={currentUser.user_id}
                            contentType="homepage"
                            uppyId="hero-uploader"
                            onUpload={(path) => {
                              if (path) {
                                const fullUrl = path.startsWith('http')
                                  ? path
                                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
                                field.onChange(fullUrl);
                              }
                            }}
                            previewType="image"
                            bucketName="images"
                            folderPath="homepage"
                            fileAttached={field.value || null}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload the main Hero image for the Homepage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Hero Subheading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Premium Hair Artistry"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Hero Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the Hero section description..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <FormField
                control={form.control}
                name="about_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">About Image</FormLabel>
                    <FormControl>
                      <div>
                        {field.value && (
                          <>
                            <div className="mb-4 w-full flex justify-start">
                              <Image
                                src={
                                  field.value.startsWith('http')
                                    ? field.value
                                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${field.value}`
                                }
                                alt="About preview"
                                width={400}
                                height={600}
                                className="w-auto max-h-[300px] object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/images/victoria.jpg';
                                }}
                                priority
                              />
                            </div>
                            <button
                              type="button"
                              className="mt-4 flex w-auto h-auto justify-center rounded-md bg-red-500 px-3 py-1.5 text-lg text-white transition-all duration-500 hover:bg-red-500/85"
                              onClick={() => field.onChange("")}
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
                          </>
                        )}
                        {activeTab === 'about' && (
                          <Uploader
                            key={`about-uploader-${field.value || ''}`}
                            type="modal"
                            userId={currentUser.user_id}
                            contentType="about"
                            uppyId="about-uploader"
                            onUpload={(path) => {
                              if (path) {
                                const fullUrl = path.startsWith('http')
                                  ? path
                                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
                                field.onChange(fullUrl);
                              }
                            }}
                            previewType="image"
                            bucketName="images"
                            folderPath="homepage"
                            fileAttached={field.value || null}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload the About section image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="about_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">About Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the about section description..."
                        className="min-h-[200px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <FormField
                control={form.control}
                name="services_subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Services Subheading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Our Services"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Services Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the services section description..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services_important_notice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Important Notice</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any important notice for the services section..."
                        className="min-h-[100px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Notice that will be displayed prominently in the Services section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              <FormField
                control={form.control}
                name="gallery_subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Gallery Subheading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Our Work"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gallery_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Gallery Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the gallery section description..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <FormField
                control={form.control}
                name="contact_subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block">Contact Subheading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Get in Touch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block">Contact Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the contact section description..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the business address..."
                        className="min-h-[100px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          placeholder="e.g., +44 7123 456789"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block">Email</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          type="email"
                          placeholder="e.g., hello@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div className="space-y-4">
                <FormLabel>Opening Hours</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`opening_hours.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                              placeholder="e.g., Monday - Friday"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`opening_hours.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                              placeholder="e.g., 9AM - 5PM"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => remove(index)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => append({ label: '', value: '' })}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-text-primary mt-2"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Hours
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="contact_social_media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block">Instagram Profile Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center w-full">
                        <span className="px-2 py-1 bg-[#ddd] border border-[#666] rounded-md text-[#666] mr-2">@</span>
                        <Input
                          className="flex-1 rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          placeholder="victoriablushcollections"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="block w-full mt-2">
                      Enter only the Instagram profile name, e.g. "victoriablushcollections"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Footer Tab */}
            <TabsContent value="footer" className="space-y-6">
              <FormField
                control={form.control}
                name="footer_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block">Footer Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the footer description..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This text will appear in the footer of your website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-text-primary"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default EditHomepageForm;
