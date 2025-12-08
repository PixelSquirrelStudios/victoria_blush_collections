import { FaX } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import React from 'react'; // <--- IMPORTANT: Import React

const variantStyles: Record<string, string> = {
  success: 'border-green-500 text-stone-100',
  error: 'border-red-500 text-stone-100',
  warning: 'border-orange-500 text-stone-100',
  info: 'border-blue-600 text-stone-100',
  default: 'border-primary-main text-stone-100',
};

const variantAccent: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-400',
  info: 'bg-blue-500',
  default: 'bg-primary-main',
};

interface CustomToastProps {
  t?: any;
  title: string;
  message?: React.ReactNode; // <--- CHANGE THIS: from string to React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  onClose?: () => void;
}

export function CustomToast({
  t,
  title,
  message,
  variant = 'default',
  onClose,
}: CustomToastProps) {
  return (
    <div
      className={cn(
        'relative flex items-start gap-4 min-w-[350px] max-w-sm px-8 py-4 rounded-lg shadow-lg border border-stone-800 bg-linear-to-b from-stone-900 via-black to-stone-950',
        variantStyles[variant],
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-2 rounded-l-lg',
          variantAccent[variant]
        )}
      />
      {/* Content */}
      <div className="flex-1 z-10">
        <h1 className="font-medium text-stone-100 text-base">{title}</h1>
        {message && (
          <p className="text-stone-300 text-sm mt-1">{message}</p> // This `message` will now render JSX correctly
        )}
      </div>
      {/* Close button */}
      <button
        type="button"
        className="absolute top-2 right-2 text-stone-400 hover:text-stone-100 transition"
        onClick={() => {
          if (onClose) onClose();
          if (t) toast.dismiss(t);
        }}
        aria-label="Close"
      >
        <FaX size={14} />
      </button>
    </div>
  );
}

type ShowCustomToastOptions = {
  title: string;
  message?: React.ReactNode; // <--- CHANGE THIS TOO: from string to React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  autoDismiss?: boolean;
};

export function showCustomToast({
  title,
  message,
  variant = 'info',
  autoDismiss = true,
}: ShowCustomToastOptions) {
  toast.custom(
    (t) => (
      <CustomToast
        t={t}
        title={title}
        message={message} // This message is now passed as React.ReactNode
        variant={variant}
      />
    ),
    {
      duration: autoDismiss ? 6000 : Infinity,
    }
  );
}