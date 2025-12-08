'use client';

import { Button } from '@/components/ui/button';
import { Provider } from '@supabase/supabase-js';
import { JSX } from 'react';
import { IoLogoGoogle } from 'react-icons/io';
import { oAuthSignIn } from './actions';

type OAuthProvider = {
  name: Provider;
  displayName: string;
  icon?: JSX.Element;
};

export function OAUthButtons() {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <IoLogoGoogle className='size-5' />,
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      {oAuthProviders.map((provider) => (
        <Button
          key={provider.name}
          className='flex items-center justify-center gap-2 rounded-md border bg-bg-muted border-border hover:bg-bg-subtle text-text-primary p-2 cursor-pointer hover:text-accent-foreground transition-colors'
          variant='outline'
          onClick={async (event) => {
            event?.preventDefault();
            await oAuthSignIn(provider.name);
          }}
        >
          {provider.icon}
          Login With {provider.displayName}
        </Button>
      ))}
    </div>
  );
}