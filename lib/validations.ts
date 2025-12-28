import * as z from 'zod';

export const SignUpSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    repeat_password: z.string({ message: 'Repeat password is required' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters' }),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Passwords do not match',
    path: ['repeat_password'],
  });

export const SignInSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    repeat_password: z.string(),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Passwords do not match',
    path: ['repeat_password'],
  });

export const OnboardingSchema = z.object({
  username: z.string().min(1, { message: 'Username required' }),
  avatar_url: z.string(),
  has_onboarded: z.boolean(),
});

export const UserSchema = z.object({
  username: z.string().min(1, { message: 'Username required' }),
  avatar_url: z.string(),
});

export const ServiceSchema = z.object({
  icon: z.string().min(1, { message: 'Icon is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.string().min(1, { message: 'Price is required' }),
  categories: z
    .array(z.string())
    .min(1, { message: 'At least one category is required' }),
  is_highlighted: z.boolean().optional(),
});

export const GalleryImageSchema = z.object({
  image_url: z.string().min(1, { message: 'Image is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  categories: z
    .array(z.string())
    .min(1, { message: 'At least one category is required' }),
});

export const HomepageSchema = z.object({
  // Hero section
  hero_image_url: z.string().min(1, { message: 'Hero image is required' }),
  hero_subheading: z
    .string()
    .min(1, { message: 'Hero subheading is required' }),
  hero_description: z
    .string()
    .min(1, { message: 'Hero description is required' }),

  // About section
  about_image_url: z.string().optional(),
  about_description: z
    .string()
    .min(1, { message: 'About description is required' }),

  // Services section
  services_subheading: z
    .string()
    .min(1, { message: 'Services subheading is required' }),
  services_description: z
    .string()
    .min(1, { message: 'Services description is required' }),
  services_important_notice: z.string().optional(),

  // Gallery section
  gallery_subheading: z
    .string()
    .min(1, { message: 'Gallery subheading is required' }),
  gallery_description: z
    .string()
    .min(1, { message: 'Gallery description is required' }),

  // Contact section
  contact_subheading: z
    .string()
    .min(1, { message: 'Contact subheading is required' }),
  contact_description: z
    .string()
    .min(1, { message: 'Contact description is required' }),
  contact_address: z
    .string()
    .min(1, { message: 'Contact address is required' }),
  contact_phone_number: z
    .string()
    .min(1, { message: 'Phone number is required' }),
  contact_email: z.string().email({ message: 'Invalid email address' }),
  opening_hours: z
    .array(
      z.object({
        label: z
          .string()
          .min(1, { message: 'Opening hours label is required' }),
        value: z
          .string()
          .min(1, { message: 'Opening hours value is required' }),
      })
    )
    .min(1, { message: 'At least one opening hours entry is required' }),
  contact_social_media_url: z
    .string()
    .regex(/^[a-zA-Z0-9._]+$/, {
      message:
        'Enter only the Instagram profile name (letters, numbers, . or _)',
    })
    .optional()
    .or(z.literal('')),

  // Footer section
  footer_description: z
    .string()
    .min(1, { message: 'Footer description is required' }),
});
