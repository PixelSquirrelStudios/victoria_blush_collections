'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import {
  CreateGalleryImageParams,
  DeleteGalleryImageParams,
  EditGalleryImageParams,
  GetGalleryImagesParams,
} from './shared.types';

export async function createGalleryImage(params: CreateGalleryImageParams) {
  try {
    const { image_url, title, description, categories, path } = params;

    const supabase = await createClient();

    const { data: galleryImage, error: insertError } = await supabase
      .from('gallery_images')
      .insert({
        image_url,
        title,
        description,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    for (const category of categories) {
      let categoryId;
      if (category.match(/^[0-9a-fA-F-]{36}$/)) {
        categoryId = category;
      } else {
        const { data: existingCategory, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category)
          .single();
        if (categoryError) {
          console.error('Error checking existing category:', categoryError);
          throw new Error(categoryError.message);
        }
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: newCategoryError } = await supabase
            .from('categories')
            .insert([{ name: category, type: 'image' }])
            .select('id')
            .single();
          if (newCategoryError) {
            console.error('Error creating new category:', newCategoryError);
            throw new Error(newCategoryError.message);
          }
          categoryId = newCategory.id;
        }
      }
      const { error: joinError } = await supabase
        .from('categories_images')
        .insert([{ image_id: galleryImage.id, category_id: categoryId }]);
      if (joinError) {
        console.error('Error linking category to Image:', joinError);
        throw new Error(joinError.message);
      }
    }
  } catch (error) {
    console.error('Error creating Image:', error);
    throw error;
  }
}

export async function editGalleryImage(params: EditGalleryImageParams) {
  try {
    const { imageId, image_url, title, description, categories, path } = params;

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from('gallery_images')
      .update({
        image_url,
        title,
        description,
      })
      .eq('id', imageId);

    if (updateError) throw updateError;

    // Manage categories - only fetch image-type categories
    const { data: existingCategories, error: fetchCatsErr } = await supabase
      .from('categories')
      .select('id, name, type')
      .eq('type', 'image');

    if (fetchCatsErr) throw fetchCatsErr;

    const existingNames = new Set(
      existingCategories?.map((c) => c.name.toLowerCase())
    );

    const newCategoryNames = categories.filter(
      (c) => !existingNames.has(c.toLowerCase())
    );

    if (newCategoryNames.length > 0) {
      const { data: createdCats, error: catInsertErr } = await supabase
        .from('categories')
        .insert(newCategoryNames.map((name) => ({ name, type: 'image' })))
        .select();

      if (catInsertErr) throw catInsertErr;

      existingCategories.push(...(createdCats || []));
    }

    const categoryIds = categories
      .map(
        (c) =>
          existingCategories.find(
            (cat) => cat.name.toLowerCase() === c.toLowerCase()
          )?.id
      )
      .filter(Boolean);

    await supabase.from('categories_images').delete().eq('image_id', imageId);

    if (categoryIds.length) {
      const { error: insertErr } = await supabase
        .from('categories_images')
        .insert(
          categoryIds.map((id) => ({ image_id: imageId, category_id: id }))
        );

      if (insertErr) throw insertErr;
    }

    revalidatePath(path);
  } catch (error) {
    console.error('Error editing Image:', error);
    throw error;
  }
}

export async function getAllGalleryImages(params: GetGalleryImagesParams) {
  try {
    const supabase = await createClient();
    const {
      searchQuery,
      sort_by,
      categories,
      page = 1,
      page_size = 1,
    } = params;

    let imagesIds: string[] = [];
    const categoryIds =
      typeof categories === 'string' ? categories.split(',') : categories;

    if (categoryIds && categoryIds?.length > 0) {
      const { data: categoryImages, error } = await supabase
        .from('categories_images')
        .select('image_id')
        .in('category_id', categoryIds);

      if (error) {
        console.error('Error fetching category-matched Images:', error);
        return { error };
      }

      if (categoryImages.length > 0) {
        // Use Set to get unique image IDs (OR logic - any category match)
        imagesIds = Array.from(
          new Set(categoryImages.map((ci) => ci.image_id))
        );
      }

      if (imagesIds.length === 0) {
        return { data: [], totalImages: 0, pageCount: 1, isNext: false };
      }
    }
    let query = supabase.from('gallery_images').select(
      `
        id,
        title,
        description,
        image_url,
        sort_order,
        created_at,
        categories_images(categories(id, name))
        `,
      { count: 'exact' }
    );

    if (imagesIds.length > 0) query = query.in('id', imagesIds);

    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

    // Step 3: Fetch the images data
    const { data: images, count } = await query;
    if (!images || images.length === 0) {
      return { data: [], totalImages: 0, pageCount: 1, isNext: false };
    }

    const totalImages = count || 0;
    const isNext = totalImages > page * page_size;

    switch (sort_by) {
      case 'newest':
        images.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        images.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'title_ASC':
        images.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_DESC':
        images.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Default: sort by sort_order (nulls last), then by created_at
        images.sort((a, b) => {
          // Handle sort_order - nulls go to the end
          if (a.sort_order !== null && b.sort_order !== null) {
            return a.sort_order - b.sort_order;
          }
          if (a.sort_order !== null) return -1;
          if (b.sort_order !== null) return 1;
          // Both are null, sort by created_at
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
        break;
    }

    const from = (page - 1) * page_size;
    const to = from + page_size;
    const paginatedImages = images.slice(from, to);
    return {
      data: paginatedImages,
      totalImages,
      pageCount: Math.ceil(totalImages / page_size),
      isNext,
    };
  } catch (error) {
    console.error('Error fetching all Images:', error);
    return { error };
  }
}

export async function getAllImageCategories() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'image')
      .order('name', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getImageCategories(imageId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories_images')
      .select('categories(id, name)')
      .eq('image_id', imageId)
      .order('categories(name)', { ascending: true });

    const categories = data ? data.map((item) => item.categories) : [];

    return { data: categories, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getGalleryImageById(imageId: string) {
  try {
    const supabase = await createClient();

    const { data: image, error } = await supabase
      .from('gallery_images')
      .select(
        `
        id,
        title,
        description,
        image_url,
        sort_order,
        created_at,
        categories_images(categories(id, name))
        `
      )
      .eq('id', imageId)
      .single();

    if (error) throw error;

    return image;
  } catch (error) {
    console.error('Error fetching image by ID:', error);
    return { data: null, error };
  }
}

export async function getPublicGalleryImages() {
  try {
    const supabase = await createClient();

    const { data: images, error } = await supabase
      .from('gallery_images')
      .select(
        `
        id,
        title,
        description,
        image_url,
        sort_order,
        created_at,
        categories_images(categories(id, name))
        `
      )
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: images, error: null };
  } catch (error) {
    console.error('Error fetching public images:', error);
    return { data: null, error };
  }
}

export async function updateGalleryImagesOrder(
  images: { id: string; sort_order: number }[]
) {
  try {
    const supabase = await createClient();

    // Update each image's sort_order
    for (const image of images) {
      const { error } = await supabase
        .from('gallery_images')
        .update({ sort_order: image.sort_order })
        .eq('id', image.id);

      if (error) throw error;
    }

    revalidatePath('/dashboard/gallery-images');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating images order:', error);
    throw error;
  }
}

export async function deleteGalleryImage({
  imageId,
}: DeleteGalleryImageParams) {
  try {
    const supabase = await createClient();

    // Get image details to find associated storage files
    const { data: image, error: fetchError } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;
    if (!image) {
      console.warn(`No image found for id ${imageId}`);
      return false;
    }

    const { image_url } = image;
    // Delete image from storage
    if (image_url) {
      try {
        const bucketName = 'images';
        // Extract relative path from full URL
        const relativePath = decodeURIComponent(
          image_url.replace(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`,
            ''
          )
        );

        const { error } = await supabase.storage
          .from(bucketName)
          .remove([relativePath]);

        if (error) console.error('Error deleting image:', error);
        else console.log('Image deleted:', relativePath);
      } catch (err) {
        console.error('Error processing image deletion:', err);
      }
    }

    // Delete related entries in categories_images
    const { error: ciDeleteError } = await supabase
      .from('categories_images')
      .delete()
      .eq('image_id', imageId);

    if (ciDeleteError) {
      console.error('Error deleting categories_images:', ciDeleteError);
    } else {
      console.log('Categories_images entries deleted');
    }

    // Delete image record itself
    const { error: deleteImageErr } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId);

    if (deleteImageErr) throw deleteImageErr;
    console.log(`Image ${imageId} and related assets deleted successfully.`);

    return true;
  } catch (error) {
    console.error('Error deleting Image:', error);
    throw error;
  }
}
