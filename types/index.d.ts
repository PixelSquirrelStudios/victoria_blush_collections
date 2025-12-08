import { JwtPayload, User } from '@supabase/supabase-js';

export type ParamsProps = Promise<{ id: string }>;

export interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export interface SearchParamsComboProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface URLProps {
  params: { id: string };
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export type UserData = Promise<{
  user: JwtPayload | null;
  profile: Profile | null;
  error: string | null;
}>;

export interface SidebarLink {
  route: string;
  label: string;
}