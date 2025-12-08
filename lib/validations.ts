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
