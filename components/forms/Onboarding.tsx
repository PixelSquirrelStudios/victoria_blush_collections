"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Uploader from '../Uploader';
import { OnboardingSchema } from '@/lib/validations';
import { showCustomToast } from '../shared/CustomToast';
import { supabaseClient } from '@/lib/supabase/browserClient';
import StylisedButton from '../shared/ActionButtons/StylisedButton';

interface Props {
  profileDetails?: string;
}

const Onboarding = ({ profileDetails }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const parsedProfileDetails = profileDetails
    ? JSON.parse(profileDetails)
    : null;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    parsedProfileDetails?.avatar_url ? parsedProfileDetails?.avatar_url : null,
  );


  const profileId = parsedProfileDetails?.id;

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    defaultValues: {
      username: parsedProfileDetails?.username || "",
      avatar_url: parsedProfileDetails?.avatar_url || "",
      has_onboarded: parsedProfileDetails?.has_onboarded || false,
    },
  });

  const onAvatarUpload = (filePath: string | null) => {
    const fullUrl = filePath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`
      : null;
    form.setValue("avatar_url", fullUrl as string);
    setAvatarUrl(filePath ? fullUrl : null);
  };

  const deleteFileFromSupabase = async (filePath: string): Promise<boolean> => {
    try {
      //const supabase = createClient();
      const supabase = supabaseClient;
      const { data, error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file from Supabase:", error);
        return false;
      }

      if (data.length === 0) {
        console.warn("File not found in Supabase:", filePath);
        return false;
      }

      setAvatarUrl(null);

      return true;
    } catch (err) {
      console.error("Unexpected error in deleteFileFromSupabase:", err);
      return false;
    }
  };

  const updateImageInDatabase = async () => {
    const supabase = supabaseClient;
    if (!profileId) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', profileId);

    if (error) {
      console.error("Error updating database:", error);
      showCustomToast({
        title: "Error",
        message: "Could not update the image in the database.",
        variant: "error",
        autoDismiss: true,
      });
      return false;
    }

    return true;
  };

  const handleRemove = async () => {
    if (!avatarUrl) return;

    // Check if the avatar URL is a Supabase URL
    if (avatarUrl.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`)) {
      // It's a Supabase URL, so attempt to delete from Supabase
      let relativePath = decodeURIComponent(avatarUrl.replace(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`,
        ""
      ));

      const removed = await deleteFileFromSupabase(relativePath);

      if (removed) {
        const updated = await updateImageInDatabase();
        if (updated) {
          setAvatarUrl('');
          form.setValue('avatar_url', '');
          form.trigger('avatar_url');
          showCustomToast({
            title: "Success",
            message: "File removed successfully.",
            variant: "success",
            autoDismiss: true,
          });
        }
      } else {
        showCustomToast({
          title: "Error",
          message: "Could not delete file from storage.",
          variant: "error",
          autoDismiss: true,
        });
      }
    } else {
      // It's an external URL, so simply set avatar_url to null in the database
      const updated = await updateImageInDatabase();
      if (updated) {
        setAvatarUrl('');
        form.setValue('avatar_url', '');
        form.trigger('avatar_url');
        showCustomToast({
          title: "Success",
          message: "Avatar removed successfully.",
          variant: "success",
          autoDismiss: true,
        });
      } else {
        showCustomToast({
          title: "Error",
          message: "Could not update the image in the database.",
          variant: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof OnboardingSchema>) => {
    try {
      setIsSubmitting(true);

      await updateUser({
        userId: parsedProfileDetails?.id,
        username: values.username,
        avatar_url: values.avatar_url,
        has_onboarded: parsedProfileDetails?.has_onboarded === false ? true : false,
        path: pathname,
      });
      router.push("/");
    } catch (error) {
      console.error(error);
      showCustomToast({
        title: "Error",
        message: "Failed to update profile.",
        variant: "error",
        autoDismiss: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-xl flex-col items-start gap-10 bg-brand-secondary p-10 text-text-primary rounded-xl shadow-md"
      >
        <div className='text-2xl font-bold'>
          Complete Your Sign-Up
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Username
              </FormLabel>
              <FormControl className="mt-1.5">
                <Input
                  {...field}
                  placeholder="Enter your username..."
                  className="rounded-lg border-[#666] bg-[#eee] text-[#111]"
                />
              </FormControl>
              <FormDescription className='mt-1 text-xs text-text-primary/70'>Change your Username here if you wish</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar_url"
          render={() => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="text-md">
                Avatar
              </FormLabel>
              <FormControl className="mt-1.5">
                <div className="flex flex-row items-center justify-center gap-4">
                  {avatarUrl ? (
                    <>
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={150}
                        height={150}
                        className="h-[100px] w-[100px] object-cover"
                      />
                      <button
                        type="button"
                        className="flex w-auto justify-center items-center rounded-md bg-red-500 hover:bg-red-500/85 transition-all duration-500 px-3 py-1 text-lg text-brand-primary"
                        onClick={handleRemove}
                      >
                        Remove Image
                      </button>
                    </>
                  ) : (
                    <Uploader
                      type="modal"
                      contentType="profiles"
                      onUpload={onAvatarUpload}
                      previewType="image"
                      bucketName="images"
                      folderPath="avatars"
                      userId={parsedProfileDetails?.id}
                      fileAttached={form.watch('avatar_url') || null}
                    />
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-text-primary/70 mt-1">
                {avatarUrl ? 'Your current Avatar is shown. Click the Remove button to upload a different one' : 'No Avatar uploaded. Click the button to add one now or a default Avatar will be used.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-center">
          <button type="submit" className="bg-interactive-active hover:bg-interactive-active/90 transition-all duration-300 text-brand-primary font-semibold py-2 px-6">
            Submit & Complete Sign-Up
          </button>
        </div>
      </form>
    </Form>
  );
};

export default Onboarding;
