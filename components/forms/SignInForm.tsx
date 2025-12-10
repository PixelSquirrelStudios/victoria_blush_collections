'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showCustomToast } from '../shared/CustomToast';
import { SignInSchema } from '@/lib/validations';
import { supabaseClient } from '@/lib/supabase/browserClient';
import { signIn } from '@/app/(auth)/actions';
import { PasswordInput } from '../ui/password-input';

interface Props {
  currentUser?: string;
  profileDetails?: string;
  onCancel?: () => void;
}

const SignInForm = ({ currentUser, profileDetails, onCancel }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const parsedProfileDetails = profileDetails
    ? JSON.parse(profileDetails)
    : null;

  const form = useForm<z.infer<typeof SignInSchema>>({
    defaultValues: {
      email: parsedProfileDetails?.email || "",
      password: parsedProfileDetails?.password || "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    setIsSubmitting(true);
    try {
      // Sign in the user first
      const signInResponse = await signIn(values);
      if (!signInResponse) {
        //const supabase = createClient();
        const supabase = supabaseClient;

        const { data } = await supabase.auth.getClaims();
        const claims = data?.claims;
        if (!claims) throw new Error("No claims found in authentication response.");

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_onboarded')
          .eq('id', claims.sub)
          .single();

        if (error) throw error;

        // Redirect based on onboarding status
        router.push(profile?.has_onboarded ? '/' : '/onboarding');
        showCustomToast({
          title: "Logged In.",
          message: "You have successfully logged in.",
          variant: "success",
          autoDismiss: true,
        });
      } else {
        showCustomToast({
          title: "Login Failed",
          message: signInResponse,
          variant: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      showCustomToast({
        title: "An error occurred.",
        message: "Unable to sign in. Please try again.",
        variant: "error",
        autoDismiss: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-2xl bg-transparent text-text-primary"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Email<span className="ml-1 text-red-900">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-lg border border-bg-section bg-bg-primary text-text-primary"
                  placeholder="Enter your Email..."
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription className='text-stone-500 hidden'>Enter your Email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Password<span className="ml-1 text-red-900">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput {...field} autoComplete="current-password" />
              </FormControl>
              <FormDescription className="text-stone-500 hidden">
                Enter your Password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link
          className="text-xs text-text-body underline"
          href="/forgot-password"
        >
          Forgot Password?
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full bg-interactive-active hover:bg-interactive-active/90 text-brand-primary transition-all duration-300"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
};
export default SignInForm;