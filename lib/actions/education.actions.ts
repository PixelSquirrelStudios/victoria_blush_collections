'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { EducationHeroSchema } from '@/lib/validations';
import type { z } from 'zod';

type EducationData = z.infer<typeof EducationHeroSchema>;

export async function getEducationData() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('education')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching education data:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in getEducationData:', error);
    return { data: null, error: error.message };
  }
}

export async function updateEducation(
  educationData: EducationData,
  path: string,
) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { data: null, error: 'Please sign in to edit education.' };
    const values = EducationHeroSchema.parse(educationData);

    // Check if education data exists
    const { data: existing } = await supabase
      .from('education')
      .select('id')
      .single();

    let result;

    if (existing) {
      // Update existing record
      result = await supabase
        .from('education')
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new record
      result = await supabase
        .from('education')
        .insert({
          ...values,
          who_heading: '',
          help_heading: '',
          help_description: '',
          approach_heading: '',
          outcome_heading: '',
          why_me_heading: '',
          why_me_image_url: '',
          contact_heading: '',
          contact_description: '',
        })
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error updating education:', error);
      return { data: null, error: error.message };
    }

    revalidatePath(path);
    revalidatePath('/education');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in updateEducation:', error);
    return { data: null, error: error.message };
  }
}
