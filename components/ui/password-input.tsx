'use client';

import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative flex items-center">
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={cn(
            'pr-10',
            'rounded-lg border border-bg-section bg-bg-primary text-text-primary',
            'hide-password-toggle',
            className
          )}
          {...props}
        />

        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((s) => !s)}
          disabled={props.disabled}
          className={cn(
            'absolute inset-y-0 right-0 z-10 flex items-center justify-center px-3',
            'text-text-primary hover:text-text-secondary transition-all duration-300',
            'focus:outline-none',
            'cursor-pointer',
            props.disabled && 'cursor-not-allowed opacity-60'
          )}
          style={{ pointerEvents: 'auto' }}
        >
          {show ? (
            <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">{show ? 'Hide password' : 'Show password'}</span>
        </button>

        {/* Hide native reveal/clear UI on some browsers */}
        <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';