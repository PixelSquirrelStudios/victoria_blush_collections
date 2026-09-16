'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sectionSchema, sectionTypeSchema, type PageSection, type SectionType } from '@/lib/sections';
import { hasSectionCopy, sanitizeSectionCopy } from '@/lib/section-html';

function refreshSections() {
  revalidatePath('/education');
  revalidatePath('/');
  revalidatePath('/dashboard/edit-education');
}

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0].message;
  return error instanceof Error ? error.message : 'Unable to save sections. Please try again.';
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Please sign in to manage sections.');
  return supabase;
}

export async function getSections(type: SectionType) {
  try {
    const pageType = sectionTypeSchema.parse(type);
    const supabase = await createClient();
    const { data, error } = await supabase.from('sections').select('*')
      .eq('type', pageType).order('sort_order').order('id');
    if (error) throw new Error(error.message);
    return { data: data as PageSection[], error: null };
  } catch (error) {
    return { data: [] as PageSection[], error: errorMessage(error) };
  }
}

export async function saveSection(input: unknown, id?: string) {
  try {
    const values = sectionSchema.parse(input);
    if (id) z.uuid().parse(id);
    const supabase = await authenticatedClient();
    const copy = sanitizeSectionCopy(values.copy);
    if (!hasSectionCopy(copy)) throw new Error('Enter section copy.');
    const payload = {
      ...values,
      copy,
      cta_text: values.has_cta ? values.cta_text : '',
      cta_link: values.has_cta ? values.cta_link : '',
    };
    const query = id
      ? supabase.from('sections').update(payload).eq('id', id)
      : supabase.from('sections').insert(payload);
    const { data, error } = await query.select('*').single();
    if (error) throw new Error(error.message);
    refreshSections();
    return { data: data as PageSection, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

export async function deleteSection(id: string) {
  try {
    z.uuid().parse(id);
    const supabase = await authenticatedClient();
    const { error } = await supabase.from('sections').delete().eq('id', id).select('id').single();
    if (error) throw new Error(error.message);
    refreshSections();
    return { error: null };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function reorderSections(type: SectionType, ids: string[]) {
  try {
    sectionTypeSchema.parse(type);
    z.array(z.uuid()).parse(ids);
    if (new Set(ids).size !== ids.length) throw new Error('Section IDs must be unique.');
    const supabase = await authenticatedClient();
    const { error } = await supabase.rpc('reorder_sections', { page_type: type, section_ids: ids });
    if (error) throw new Error(error.message);
    refreshSections();
    return { error: null };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}