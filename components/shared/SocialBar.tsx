import { Mail, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa6';

interface SocialBarProps {
  variant?: 'default' | 'inverted';
  className?: string;
}

const SocialBar = ({ variant = 'default', className = '' }: SocialBarProps) => {
  const buttonClass =
    variant === 'inverted'
      ? 'p-3 bg-text-primary text-brand-secondary rounded-full hover:bg-text-primary/90 transition-colors duration-300'
      : 'p-3 bg-brand-secondary rounded-full hover:bg-brand-secondary-hover transition-colors duration-300';
  return (
    <div className={`flex gap-4 ${className}`}>
      <a
        href="https://instagram.com/victoriablushcollections"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label="Instagram"
      >
        <FaInstagram className="w-5 h-5" />
      </a>
      <a
        href="https://facebook.com/victoriablushcollections"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label="Facebook"
      >
        <FaFacebookF className="w-5 h-5" />
      </a>
      <a
        href="mailto:hello@victoriablushcollections.co.uk"
        className={buttonClass}
        aria-label="Email"
      >
        <Mail className="w-5 h-5" />
      </a>
      <a
        href="tel:+447123456789"
        className={buttonClass}
        aria-label="Phone"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
};
export default SocialBar;
