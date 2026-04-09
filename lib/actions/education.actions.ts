'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';

interface EducationData {
  hero_heading: string;
  hero_subheading: string;
  hero_description_1: string;
  hero_description_2: string;
  hero_image_url: string;
  who_heading: string;
  who_descriptions: string[];
  help_heading: string;
  help_description: string;
  help_items: string[];
  approach_heading: string;
  approach_paragraphs: string[];
  outcome_heading: string;
  outcome_paragraphs: string[];
  why_me_heading: string;
  why_me_paragraphs: string[];
  why_me_image_url: string;
  contact_heading: string;
  contact_description: string;
  contact_button_text: string;
  contact_note?: string;
}

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
          ...educationData,
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
          ...educationData,
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
