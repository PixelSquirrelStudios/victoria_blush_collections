import { createClient } from '@/lib/supabase/client';

export async function deleteFileFromSupabase(
  path: string,
  bucket: string
): Promise<boolean> {
  try {
    const sb = createClient();
    const { error } = await sb.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Error deleting file from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception deleting file from Supabase:', e);
    return false;
  }
}
