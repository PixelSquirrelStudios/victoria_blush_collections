'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';

interface OpeningHours {
  label: string;
  value: string;
}

interface HomepageData {
  hero_image_url: string;
  hero_subheading: string;
  hero_description: string;
  about_description: string;
  services_subheading: string;
  services_description: string;
  services_important_notice?: string;
  gallery_subheading: string;
  gallery_description: string;
  contact_subheading: string;
  contact_description: string;
  contact_address: string;
  contact_phone_number: string;
  contact_email: string;
  opening_hours: OpeningHours[];
  contact_social_media_url?: string;
  footer_description: string;
}

export async function getHomepageData() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching homepage data:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in getHomepageData:', error);
    return { data: null, error: error.message };
  }
}

export async function updateHomepage(homepageData: HomepageData, path: string) {
  try {
    const supabase = await createClient();

    // Check if homepage data exists
    const { data: existing } = await supabase
      .from('homepage')
      .select('id')
      .single();

    let result;

    if (existing) {
      // Update existing record
      result = await supabase
        .from('homepage')
        .update({
          ...homepageData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new record
      result = await supabase
        .from('homepage')
        .insert({
          ...homepageData,
        })
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error updating homepage:', error);
      return { data: null, error: error.message };
    }

    revalidatePath(path);
    revalidatePath('/');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in updateHomepage:', error);
    return { data: null, error: error.message };
  }
}
