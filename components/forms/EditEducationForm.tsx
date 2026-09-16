'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { z } from 'zod';
import Image from 'next/image';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EducationHeroSchema } from '@/lib/validations';
import { updateEducation } from '@/lib/actions/education.actions';
import { showCustomToast } from '@/components/shared/CustomToast';
import Uploader from '@/components/shared/Uploader';

type HeroData = z.infer<typeof EducationHeroSchema>;

interface Props {
  currentUser: { user_id: string };
  educationData?: Partial<HeroData> | null;
}

export default function EditEducationForm({ educationData, currentUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<HeroData>({
    resolver: zodResolver(EducationHeroSchema),
    defaultValues: {
      hero_heading: educationData?.hero_heading || '',
      hero_subheading: educationData?.hero_subheading || '',
      hero_description_1: educationData?.hero_description_1 || '',
      hero_description_2: educationData?.hero_description_2 || '',
      hero_image_url: educationData?.hero_image_url || '',
      contact_button_text: educationData?.contact_button_text || 'Enquire about education',
    },
  });

  async function onSubmit(values: HeroData) {
    setIsSubmitting(true);
    try {
      const result = await updateEducation(values, '/dashboard/edit-education');
      if (result.error) throw new Error(result.error);
      showCustomToast({ title: 'Saved', message: 'Education hero updated.', variant: 'success' });
      form.reset(values);
    } catch (error) {
      showCustomToast({ title: 'Error', message: error instanceof Error ? error.message : 'Unable to save hero.', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const textFields = [
    { name: 'hero_heading', label: 'Heading', multiline: false },
    { name: 'hero_subheading', label: 'Subheading', multiline: true },
    { name: 'hero_description_1', label: 'Intro Paragraph 1', multiline: true },
    { name: 'hero_description_2', label: 'Intro Paragraph 2', multiline: true },
    { name: 'contact_button_text', label: 'Hero Button Text', multiline: false },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
          <FormField control={form.control} name="hero_image_url" render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {field.value && (
                    <div className="flex flex-wrap items-end gap-3">
                      <Image src={field.value.startsWith('http') || field.value.startsWith('/') ? field.value : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${field.value}`} alt="Education hero preview" width={300} height={400} className="max-h-72 w-auto max-w-full object-contain" />
                      <Button type="button" variant="destructive" className="bg-red-500 text-white hover:bg-red-500/85" onClick={() => field.onChange('')}><Trash2 className="size-4" />Remove Image</Button>
                    </div>
                  )}
                  <Uploader type="modal" userId={currentUser.user_id} contentType="education" uppyId="edu-hero-uploader" onUpload={(path) => {
                    if (path) field.onChange(path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`);
                  }} previewType="image" bucketName="images" folderPath="education" fileAttached={field.value || null} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {textFields.map(({ name, label, multiline }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  {multiline ? <Textarea {...field} className="min-h-32 bg-white text-text-primary" /> : <Input {...field} className="bg-white text-text-primary" />}
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
          <Button type="submit" disabled={isSubmitting} className="bg-interactive-active text-white hover:bg-bg-dark"><Save className="mr-2 size-4" />{isSubmitting ? 'Saving...' : 'Save Hero'}</Button>
        </fieldset>
      </form>
    </Form>
  );
}