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
