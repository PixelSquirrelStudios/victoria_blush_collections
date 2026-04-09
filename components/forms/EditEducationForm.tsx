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

import { EducationSchema } from '@/lib/validations';
import { updateEducation } from '@/lib/actions/education.actions';
import { showCustomToast } from '@/components/shared/CustomToast';
import Uploader from '../shared/Uploader';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Image from 'next/image';

interface Props {
  currentUser: any;
  educationData?: any;
}

const EditEducationForm = ({ educationData, currentUser }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const form = useForm<z.infer<typeof EducationSchema>>({
    resolver: zodResolver(EducationSchema),
    defaultValues: {
      // Hero
      hero_heading: educationData?.hero_heading || '',
      hero_subheading: educationData?.hero_subheading || '',
      hero_description_1: educationData?.hero_description_1 || '',
      hero_description_2: educationData?.hero_description_2 || '',
      hero_image_url: educationData?.hero_image_url || '',
      // Who This Is For
      who_heading: educationData?.who_heading || '',
      who_descriptions: educationData?.who_descriptions?.length ? educationData.who_descriptions : ['', ''],
      // What I Can Help With
      help_heading: educationData?.help_heading || '',
      help_description: educationData?.help_description || '',
      help_items: educationData?.help_items?.length ? educationData.help_items : [''],
      // My Approach & The Outcome
      expect_heading: educationData?.expect_heading || 'What You Can Expect',
      approach_heading: educationData?.approach_heading || '',
      approach_paragraphs: educationData?.approach_paragraphs?.length ? educationData.approach_paragraphs : [''],
      outcome_heading: educationData?.outcome_heading || '',
      outcome_paragraphs: educationData?.outcome_paragraphs?.length ? educationData.outcome_paragraphs : [''],
      // Why Me
      why_me_heading: educationData?.why_me_heading || '',
      why_me_paragraphs: educationData?.why_me_paragraphs?.length ? educationData.why_me_paragraphs : [''],
      why_me_image_url: educationData?.why_me_image_url || '',
      // Contact
      contact_heading: educationData?.contact_heading || '',
      contact_description: educationData?.contact_description || '',
      contact_button_text: educationData?.contact_button_text || '',
      contact_note: educationData?.contact_note || '',
    },
  });

  // Field arrays for repeater fields
  // @ts-ignore - useFieldArray expects object arrays but we use string arrays
  const helpItems = useFieldArray({ control: form.control, name: 'help_items' as any });
  // @ts-ignore
  const whoDescriptions = useFieldArray({ control: form.control, name: 'who_descriptions' as any });
  // @ts-ignore
  const approachParagraphs = useFieldArray({ control: form.control, name: 'approach_paragraphs' as any });
  // @ts-ignore
  const outcomeParagraphs = useFieldArray({ control: form.control, name: 'outcome_paragraphs' as any });
  // @ts-ignore
  const whyMeParagraphs = useFieldArray({ control: form.control, name: 'why_me_paragraphs' as any });

  async function onSubmit(values: z.infer<typeof EducationSchema>) {
    setIsSubmitting(true);

    try {
      const result = await updateEducation(values, '/dashboard/edit-education');

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
        message: 'Education page updated successfully',
        variant: 'success',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Form submission error:', error);
      showCustomToast({
        title: 'Error',
        message: 'Failed to update education page',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reusable repeater for simple string arrays
  const renderRepeater = (
    label: string,
    fieldArray: any,
    fieldName: string,
    placeholder: string
  ) => (
    <div className="space-y-4">
      <FormLabel>{label}</FormLabel>
      {fieldArray.fields.map((item: any, index: number) => (
        <div key={item.id} className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name={`${fieldName}.${index}` as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder={placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fieldArray.fields.length > 1 && (
            <Button
              type="button"
              size="icon"
              onClick={() => fieldArray.remove(index)}
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
          onClick={() => fieldArray.append('' as any)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-text-primary mt-2"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );

  // Reusable repeater for textarea (paragraphs)
  const renderTextareaRepeater = (
    label: string,
    fieldArray: any,
    fieldName: string,
    placeholder: string
  ) => (
    <div className="space-y-4">
      <FormLabel>{label}</FormLabel>
      {fieldArray.fields.map((item: any, index: number) => (
        <div key={item.id} className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name={`${fieldName}.${index}` as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    className="min-h-[100px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                    placeholder={placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fieldArray.fields.length > 1 && (
            <Button
              type="button"
              size="icon"
              onClick={() => fieldArray.remove(index)}
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
          onClick={() => fieldArray.append('' as any)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-text-primary mt-2"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Paragraph
        </Button>
      </div>
    </div>
  );

  // Reusable image uploader field
  const renderImageField = (
    fieldName: 'hero_image_url' | 'why_me_image_url',
    label: string,
    description: string,
    uploaderTab: string,
    uppyId: string
  ) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-md">{label}</FormLabel>
          <FormControl>
            <div>
              <div className="mb-4">
                <Image
                  src={
                    field.value
                      ? (field.value.startsWith('http')
                        ? field.value
                        : field.value.startsWith('/')
                          ? field.value
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${field.value}`)
                      : '/assets/images/placeholder-hero.jpg'
                  }
                  alt={`${label} preview`}
                  width={400}
                  height={600}
                  className="w-auto max-h-[300px] object-contain"
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
                  onClick={() => field.onChange('')}
                >
                  <div className="flex flex-row items-center gap-1">
                    <FaTrash className="inline mr-2 text-lg" />
                    <span>Remove Image</span>
                  </div>
                </button>
              )}
              {activeTab === uploaderTab && (
                <Uploader
                  key={`${uppyId}-${field.value || ''}`}
                  type="modal"
                  userId={currentUser.user_id}
                  contentType="education"
                  uppyId={uppyId}
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
                  folderPath="education"
                  fileAttached={field.value || null}
                />
              )}
            </div>
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <div className="flex w-full flex-col items-start gap-10 bg-brand-secondary p-10 text-text-primary rounded-xl shadow-md">
        <div className="w-full flex md:flex-row flex-col max-sm:justify-center justify-start items-center gap-4 pb-2">
          <h1 className="text-2xl text-text-primary font-semibold">
            Edit Education Page
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
              <TabsTrigger value="who">Who For</TabsTrigger>
              <TabsTrigger value="help">Help With</TabsTrigger>
              <TabsTrigger value="approach">Approach</TabsTrigger>
              <TabsTrigger value="why-me">Why Me</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* Hero Tab */}
            <TabsContent value="hero" className="space-y-6">
              {renderImageField('hero_image_url', 'Hero Image', 'Upload the main hero image for the Education page', 'hero', 'edu-hero-uploader')}

              <FormField
                control={form.control}
                name="hero_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Heading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Education built from over 20 years behind the chair"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Subheading</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-20 rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Helping salons and stylists build confidence..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_description_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Intro Paragraph 1</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the first intro paragraph..."
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
                name="hero_description_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Intro Paragraph 2</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the second intro paragraph..."
                        className="min-h-[150px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Who This Is For Tab */}
            <TabsContent value="who" className="space-y-6">
              <FormField
                control={form.control}
                name="who_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Section Heading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Who This Is For"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderTextareaRepeater('Descriptions', whoDescriptions, 'who_descriptions', 'Enter a description...')}
            </TabsContent>

            {/* What I Can Help With Tab */}
            <TabsContent value="help" className="space-y-6">
              <FormField
                control={form.control}
                name="help_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Section Heading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., What I Can Help With"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="help_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the description..."
                        className="min-h-[100px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderRepeater('Bullet Points', helpItems, 'help_items', 'e.g., Building confidence behind the chair')}
            </TabsContent>

            {/* My Approach & The Outcome Tab */}
            <TabsContent value="approach" className="space-y-8">
              <div className="border border-border-light rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Section Heading</h3>
                <FormField
                  control={form.control}
                  name="expect_heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-md">Heading</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          placeholder="e.g., What You Can Expect"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border border-border-light rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">My Approach</h3>
                <FormField
                  control={form.control}
                  name="approach_heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-md">Heading</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          placeholder="e.g., My Approach"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderTextareaRepeater('Paragraphs', approachParagraphs, 'approach_paragraphs', 'Enter a paragraph...')}
              </div>

              <div className="border border-border-light rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">The Outcome</h3>
                <FormField
                  control={form.control}
                  name="outcome_heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-md">Heading</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                          placeholder="e.g., The Outcome"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderTextareaRepeater('Paragraphs', outcomeParagraphs, 'outcome_paragraphs', 'Enter a paragraph...')}
              </div>
            </TabsContent>

            {/* Why Me Tab */}
            <TabsContent value="why-me" className="space-y-6">
              <FormField
                control={form.control}
                name="why_me_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Section Heading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Why Work With Me"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {renderTextareaRepeater('Paragraphs', whyMeParagraphs, 'why_me_paragraphs', 'Enter a paragraph...')}

              {renderImageField('why_me_image_url', 'Why Me Image', 'Upload the image for the Why Me section', 'why-me', 'edu-whyme-uploader')}
            </TabsContent>

            {/* Contact / CTA Tab */}
            <TabsContent value="contact" className="space-y-6">
              <FormField
                control={form.control}
                name="contact_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Section Heading</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Get In Touch"
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
                    <FormLabel className="mb-2 block text-md">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the contact description..."
                        className="min-h-[100px] rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_button_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Button Text</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Enquire about education"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-md">Note (optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                        placeholder="e.g., Introductory rates available for first bookings."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Small italic note shown below the enquire button
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

export default EditEducationForm;
