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

export async function updateOwnAvatar(filePath: string | null) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Please sign in to update your avatar.' };
  if (filePath !== null && (!filePath.startsWith(`avatars/${user.id}/`) || filePath.split('/').length !== 3 || /[\\?#]|\.\./.test(filePath))) {
    return { error: 'Please upload an avatar for your own account.' };
  }
  const avatarUrl = filePath ? supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl : null;
  const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id).select('id').single();
  if (error) return { error: 'Your avatar could not be saved. Please try again.' };
  revalidatePath('/dashboard', 'layout');
  return { error: null };
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
