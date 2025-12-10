"use client";

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
import { signUp } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { SignUpSchema } from "@/lib/validations";
import { PasswordInput } from '../ui/password-input';
import { showCustomToast } from '../shared/CustomToast';

interface Props {
  profileDetails?: string;
  onCancel?: () => void;
}

const SignUpForm = ({ profileDetails, onCancel }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const parsedProfileDetails = profileDetails
    ? JSON.parse(profileDetails)
    : null;

  const form = useForm<z.infer<typeof SignUpSchema>>({
    defaultValues: {
      email: parsedProfileDetails?.email || "",
      password: parsedProfileDetails?.password || "",
      repeat_password: parsedProfileDetails?.repeat_password || "",
      username: parsedProfileDetails?.username || "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    console.log("Submitting form with values:", values);
    if (values.password !== values.repeat_password) {
      showCustomToast({
        title: "Error",
        message: "Passwords do not match.",
        variant: "error",
        autoDismiss: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(values);
      onCancel && onCancel();
      router.push("/onboarding");
      showCustomToast({
        title: "Account created.",
        message: "You have successfully created an account.",
        variant: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
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
                  className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                  placeholder="Enter your Email"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-stone-500 hidden">
                Enter an Email.
              </FormDescription>
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
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormDescription className="text-stone-500 hidden">
                Enter a Password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repeat_password"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Repeat Password<span className="ml-1 text-red-900">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                />
              </FormControl>
              <FormDescription className="text-stone-500 hidden">
                Confirm the Password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Username<span className="ml-1 text-red-900">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-lg border border-[#666] bg-[#eee] text-[#111]"
                  placeholder="Minimum 3 characters"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-stone-500 hidden">
                Enter a Username.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className='mt-2 w-full bg-interactive-active hover:bg-interactive-active/90 text-brand-primary transition-all duration-300'
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
