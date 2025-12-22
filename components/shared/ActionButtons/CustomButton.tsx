'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CustomButtonProps {
  variant?: string;
  children?: React.ReactNode;
  hasLink?: boolean;
  link?: string;
  size?: string;
  forcePrimary?: boolean;
  className?: string;
}

const CustomButton = ({
  variant,
  children,
  hasLink,
  link,
  size,
  forcePrimary,
  className,
}: CustomButtonProps) => {
  const pathname = usePathname();

  const baseClass = `${
    size === 'large'
      ? 'font-medium text-2xl rounded-full px-10 py-6 transition-all'
      : 'font-medium text-lg rounded-full px-6 py-3 transition-all'
  } ${className}`;

  const linkedButtonClass =
    (hasLink && link === pathname) || variant === 'primary' || forcePrimary
      ? 'bg-brand-primary hover:bg-brand-primary/90 border-2 border-brand-secondary hover:border-brand-secondary/90 text-text-primary'
      : 'bg-[#c4abf8] hover:bg-primary-main border-2 border-primary-main hover:border-[#c4abf8] text-[#353535] hover:text-white';

  const unlinkedButtonClass =
    'bg-brand-primary border-2 border-[#c4abf8] text-white pointer-events-none';
  const buttonClass =
    pathname !== link
      ? `${baseClass} ${linkedButtonClass}`
      : `${baseClass} ${unlinkedButtonClass}`;

  const ButtonContent = <Button className={buttonClass}>{children}</Button>;

  return hasLink && link ? (
    <Link href={link}>{ButtonContent}</Link>
  ) : (
    ButtonContent
  );
};

export default CustomButton;
