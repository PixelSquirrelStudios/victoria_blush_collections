'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { UpdateUserParams } from './shared.types';

export async function getUserWithProfile(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }

    return data;
  } catch (error) {
    return { user: null, profile: null, error };
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    const supabase = await createClient();

    const { userId, username, avatar_url, has_onboarded, path } = params;

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        username,
        avatar_url,
        has_onboarded,
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError);
      throw new Error(
        'Failed to update profile details after vibe check update.'
      );
    }

    if (path) {
      revalidatePath(path);
      revalidatePath('/dashboard');
    }
  } catch (error) {
    return { data: null, error };
  }
}
