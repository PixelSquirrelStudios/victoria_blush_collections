"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Uploader from '../shared/Uploader';
import { UserSchema } from '@/lib/validations';
import { showCustomToast } from '../shared/CustomToast';
import { supabaseClient } from '@/lib/supabase/browserClient';
import { Save, Trash2 } from 'lucide-react';
import styles from '@/components/booking/booking.module.css';

interface Props {
  profileDetails?: string;
}

const EditUserForm = ({ profileDetails }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const parsedProfileDetails = profileDetails
    ? JSON.parse(profileDetails)
    : null;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    parsedProfileDetails?.avatar_url ? parsedProfileDetails?.avatar_url : null,
  );

  const profileId = parsedProfileDetails?.id;

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      username: parsedProfileDetails?.username || "",
      avatar_url: parsedProfileDetails?.avatar_url || "",
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
        setAvatarUrl('');
        form.setValue('avatar_url', '');
        form.trigger('avatar_url');
        // Immediately update the DB column to '' as well
        if (profileId) {
          try {
            await updateUser({
              userId: profileId,
              username: form.getValues('username'),
              avatar_url: '',
              has_onboarded: parsedProfileDetails?.has_onboarded ?? false,
              path: pathname,
            });
          } catch (err) {
            showCustomToast({
              title: 'Warning',
              message: 'Avatar removed locally, but failed to update user in database.',
              variant: 'error',
              autoDismiss: true,
            });
          }
        }
        showCustomToast({
          title: "Success",
          message: "File removed successfully",
          variant: "success",
          autoDismiss: true,
        });
      } else {
        showCustomToast({
          title: "Error",
          message: "Could not delete file from storage",
          variant: "error",
          autoDismiss: true,
        });
      }
    } else {
      // It's an external URL, so simply set avatar_url to null in the database
      if (profileId) {
        try {
          await updateUser({
            userId: profileId,
            username: form.getValues('username'),
            avatar_url: '',
            has_onboarded: parsedProfileDetails?.has_onboarded ?? false,
            path: pathname,
          });
          setAvatarUrl('');
          form.setValue('avatar_url', '');
          form.trigger('avatar_url');
          showCustomToast({
            title: "Success",
            message: "Avatar removed successfully",
            variant: "success",
            autoDismiss: true,
          });
        } catch (err) {
          showCustomToast({
            title: "Error",
            message: "Could not update the image in the database",
            variant: "error",
            autoDismiss: true,
          });
        }
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    try {
      setIsSubmitting(true);

      await updateUser({
        userId: parsedProfileDetails?.id,
        username: values.username,
        avatar_url: values.avatar_url,
        has_onboarded: parsedProfileDetails?.has_onboarded,
        path: pathname,
      });

      showCustomToast({
        title: "Success",
        message: "Profile updated successfully",
        variant: "success",
        autoDismiss: true,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      showCustomToast({
        title: "Error",
        message: "Failed to update profile",
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
        className={`${styles.surface} ${styles.avatarForm}`}
      >
        <fieldset disabled={isSubmitting} className={styles.avatarFields}>
          <legend className="sr-only">Your Profile</legend>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className={styles.field}>
              <FormLabel className="text-md">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your username..."
                  className={styles.input}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar_url"
          render={() => (
            <FormItem>
                <div className={styles.avatarBody}>
                  <Image src={avatarUrl || '/assets/images/Default_Avatar.jpg'} alt="Your avatar preview" width={128} height={128} className={styles.avatarPreview} />
                  <div className={styles.avatarControls}>
                    <h2>Profile Photo</h2>
                    <div className={styles.avatarUpload}>
                      <Uploader
                        type="modal"
                        contentType="profiles"
                        onUpload={onAvatarUpload}
                        previewType="image"
                        bucketName="images"
                        folderPath="avatars"
                        userId={parsedProfileDetails?.id}
                        fileAttached={null}
                        uppyId="admin-profile-avatar"
                        allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                      />
                    </div>
                    {avatarUrl && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={handleRemove}><Trash2 size={18} />Remove Avatar</button>}
                  </div>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={styles.avatarActions}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className={`${styles.button} ${styles.secondary}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting}
          >
            <Save size={18} />{isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        </fieldset>
      </form>
    </Form>
  );
};

export default EditUserForm;
