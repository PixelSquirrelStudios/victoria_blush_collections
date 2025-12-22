export interface UpdateUserParams {
  userId: string;
  username: string;
  avatar_url?: string;
  has_onboarded?: boolean;
  path: string;
}

export interface UpdateProfileParams {
  userId: string;
  username: string;
  avatar_url?: string;
  profile_header_image_url?: string;
  path: string;
}

export interface CreateNotificationParams {
  recipient: string;
  notification_type: string;
  notification_message: string;
  notification_url: string;
  related_user?: string | null;
  is_read: boolean;
  path?: string;
}

export interface GetNotificationByIdParams {
  notificationId: string;
}

export interface GetNotificationParams {
  page?: number;
  page_size?: number;
  searchQuery?: string | string[] | null;
  sort_by?: string | string[] | null;
  notificationTypes?: string | string[] | null;
}

export interface GetUserNotificationsParams {
  page?: number;
  page_size?: number;
  searchQuery?: string | string[] | null;
  sort_by?: string | string[] | null;
  notification_types?: string | string[] | null;
  userId: any;
}

export interface DeleteNotificationParams {
  recipient: string;
  notification_type: string;
  related_user?: string;
}

export interface CreateServiceParams {
  icon: string;
  title: string;
  description: string;
  price: string;
  categories: string[];
  is_highlighted?: boolean;
  path: string;
}

export interface EditServiceParams {
  serviceId: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  categories: string[];
  is_highlighted?: boolean;
  path: string;
}

export interface DeleteServiceParams {
  serviceId: string;
}

export interface GetServicesParams {
  page?: number;
  page_size?: number;
  next?: string;
  previous?: string;
  searchQuery?: string | string[] | null;
  sort_by?: string | string[] | null;
  categories?: string | string[] | null;
  list_type?: string | string[] | null;
  is_highlighted?: string | string[] | null;
}

export interface CreateGalleryImageParams {
  image_url: string;
  title: string;
  description: string;
  categories: string[];
  path: string;
}

export interface EditGalleryImageParams {
  imageId: string;
  image_url: string;
  title: string;
  description: string;
  categories: string[];
  path: string;
}

export interface DeleteGalleryImageParams {
  imageId: string;
}

export interface GetGalleryImagesParams {
  page?: number;
  page_size?: number;
  next?: string;
  previous?: string;
  searchQuery?: string | string[] | null;
  sort_by?: string | string[] | null;
  categories?: string | string[] | null;
  list_type?: string | string[] | null;
}
