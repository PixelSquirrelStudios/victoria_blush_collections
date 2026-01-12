'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import {
  CreateServiceParams,
  DeleteServiceParams,
  EditServiceParams,
  GetServicesParams,
} from './shared.types';

export async function createService(params: CreateServiceParams) {
  try {
    const { icon, title, description, price, categories, is_highlighted } =
      params;

    const supabase = await createClient();

    const { data: service, error: insertError } = await supabase
      .from('services')
      .insert({
        icon,
        title,
        description,
        price,
        is_highlighted: is_highlighted || false,
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
          .limit(1)
          .maybeSingle();
        if (categoryError) {
          console.error('Error checking existing category:', categoryError);
          throw new Error(categoryError.message);
        }
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: newCategoryError } = await supabase
            .from('categories')
            .insert([{ name: category, type: 'service' }])
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
        .from('categories_services')
        .insert([{ service_id: service.id, category_id: categoryId }]);
      if (joinError) {
        console.error('Error linking category to Service:', joinError);
        throw new Error(joinError.message);
      }
    }
  } catch (error) {
    console.error('Error creating Service:', error);
    throw error;
  }
}

export async function editService(params: EditServiceParams) {
  try {
    const {
      serviceId,
      icon,
      title,
      description,
      price,
      categories,
      is_highlighted,
      path,
    } = params;

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from('services')
      .update({
        icon,
        title,
        description,
        price,
        is_highlighted: is_highlighted || false,
      })
      .eq('id', serviceId);

    if (updateError) throw updateError;

    // Manage categories - only fetch service-type categories
    const { data: existingCategories, error: fetchCatsErr } = await supabase
      .from('categories')
      .select('id, name, type')
      .eq('type', 'service');

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
        .insert(newCategoryNames.map((name) => ({ name, type: 'service' })))
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

    await supabase
      .from('categories_services')
      .delete()
      .eq('service_id', serviceId);

    if (categoryIds.length) {
      const { error: insertErr } = await supabase
        .from('categories_services')
        .insert(
          categoryIds.map((id) => ({ service_id: serviceId, category_id: id }))
        );

      if (insertErr) throw insertErr;
    }

    revalidatePath(path);
  } catch (error) {
    console.error('Error editing Service:', error);
    throw error;
  }
}

export async function getAllServices(params: GetServicesParams) {
  try {
    const supabase = await createClient();
    const {
      searchQuery,
      sort_by,
      categories,
      is_highlighted,
      page = 1,
      page_size = 1,
    } = params;

    let servicesIds: string[] = [];
    const categoryIds =
      typeof categories === 'string' ? categories.split(',') : categories;

    if (categoryIds && categoryIds?.length > 0) {
      const { data: categoryServices, error } = await supabase
        .from('categories_services')
        .select('service_id')
        .in('category_id', categoryIds);

      if (error) {
        console.error('Error fetching category-matched Services:', error);
        return { error };
      }

      if (categoryServices.length > 0) {
        // Use Set to get unique service IDs (OR logic - any category match)
        servicesIds = Array.from(
          new Set(categoryServices.map((cs) => cs.service_id))
        );
      }

      if (servicesIds.length === 0) {
        return { data: [], totalServices: 0, pageCount: 1, isNext: false };
      }
    }
    let query = supabase.from('services').select(
      `
        id,
        icon,
        title,
        description,
        price,
        is_highlighted,
        sort_order,
        created_at,
        categories_services(categories(id, name))
        `,
      { count: 'exact' }
    );

    if (servicesIds.length > 0) query = query.in('id', servicesIds);

    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

    if (is_highlighted === 'true') {
      query = query.eq('is_highlighted', true);
    }

    // Step 3: Fetch the services data
    const { data: services, count } = await query;
    if (!services || services.length === 0) {
      return { data: [], totalServices: 0, pageCount: 1, isNext: false };
    }

    const totalServices = count || 0;
    const isNext = totalServices > page * page_size;

    switch (sort_by) {
      case 'newest':
        services.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        services.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'title_ASC':
        services.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_DESC':
        services.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Default: sort by sort_order (nulls last), then by created_at
        services.sort((a, b) => {
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
    const paginatedServices = services.slice(from, to);
    return {
      data: paginatedServices,
      totalServices,
      pageCount: Math.ceil(totalServices / page_size),
      isNext,
    };
  } catch (error) {
    console.error('Error fetching all News:', error);
    return { error };
  }
}

export async function getAllServiceCategories() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'service')
      .order('name', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getServiceCategories(serviceId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories_services')
      .select('categories(id, name)')
      .eq('service_id', serviceId)
      .order('categories(name)', { ascending: true });

    const categories = data ? data.map((item) => item.categories) : [];

    return { data: categories, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getServiceById(serviceId: string) {
  try {
    const supabase = await createClient();

    const { data: service, error } = await supabase
      .from('services')
      .select(
        `
        id,
        icon,
        title,
        description,
        price,
        is_highlighted,
        sort_order,
        created_at,
        categories_services(categories(id, name))
        `
      )
      .eq('id', serviceId)
      .single();

    if (error) throw error;

    return service;
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    return { data: null, error };
  }
}

export async function getPublicServices() {
  try {
    const supabase = await createClient();

    const { data: services, error } = await supabase
      .from('services')
      .select(
        `
        id,
        icon,
        title,
        description,
        price,
        is_highlighted,
        sort_order,
        created_at,
        categories_services(categories(id, name))
        `
      )
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: services, error: null };
  } catch (error) {
    console.error('Error fetching public services:', error);
    return { data: null, error };
  }
}

export async function updateServicesOrder(
  services: { id: string; sort_order: number }[]
) {
  try {
    const supabase = await createClient();

    // Update each service's sort_order
    for (const service of services) {
      const { error } = await supabase
        .from('services')
        .update({ sort_order: service.sort_order })
        .eq('id', service.id);

      if (error) throw error;
    }

    revalidatePath('/dashboard/services');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating services order:', error);
    throw error;
  }
}

export async function deleteService({ serviceId }: DeleteServiceParams) {
  try {
    const supabase = await createClient();

    // Get service icon
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('icon')
      .eq('id', serviceId)
      .single();

    if (fetchError) throw fetchError;
    if (!service) {
      console.warn(`No service found for id ${serviceId}`);
      return false;
    }

    const { icon } = service;

    // Delete icon image from storage
    if (icon) {
      try {
        const bucketName = 'images';
        // Extract relative path from full URL
        const relativePath = decodeURIComponent(
          icon.replace(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`,
            ''
          )
        );

        const { error } = await supabase.storage
          .from(bucketName)
          .remove([relativePath]);

        if (error) console.error('Error deleting icon:', error);
        else console.log('Icon deleted:', relativePath);
      } catch (err) {
        console.error('Error processing icon deletion:', err);
      }
    }

    // Delete related entries in categories_services
    const { error: csDeleteError } = await supabase
      .from('categories_services')
      .delete()
      .eq('service_id', serviceId);

    if (csDeleteError) {
      console.error('Error deleting categories_services:', csDeleteError);
    } else {
      console.log('Categories_services entries deleted');
    }

    // Delete service record itself
    const { error: deleteServiceErr } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (deleteServiceErr) throw deleteServiceErr;

    console.log(
      `Service ${serviceId} and related assets deleted successfully.`
    );

    return true;
  } catch (error) {
    console.error('Error deleting Service:', error);
    throw error;
  }
}
