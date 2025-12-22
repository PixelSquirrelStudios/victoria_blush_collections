'use server';

import { CreateCategoryParams } from '@/types';
import { createClient } from '../supabase/server';

export const createCategory = async ({ name, type }: CreateCategoryParams) => {
  const supabase = await createClient();

  // Insert the category and return id and name
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, type }])
    .select('id, name, type')
    .single();

  if (error) {
    console.error('Error creating Category:', error.message);
    return { data: null, error };
  }

  return { data, error };
};

export const getAllCategories = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('categories').select('*');

    return { data, error };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error };
  }
};

export const getCategoryById = async (categoryId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { data: null, error };
  }
};
