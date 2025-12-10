import { Mail, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa6';

const SocialBar = () => {
  return (
    <div className="flex gap-4">
      <a
        href="https://instagram.com/victoriablushcollections"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-brand-secondary rounded-full hover:bg-brand-secondary-hover transition-colors duration-300"
        aria-label="Instagram"
      >
        <FaInstagram className="w-5 h-5" />
      </a>
      <a
        href="https://facebook.com/victoriablushcollections"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-brand-secondary rounded-full hover:bg-brand-secondary-hover transition-colors duration-300"
        aria-label="Facebook"
      >
        <FaFacebookF className="w-5 h-5" />
      </a>
      <a
        href="mailto:hello@victoriablush.com"
        className="p-3 bg-brand-secondary rounded-full hover:bg-brand-secondary-hover transition-colors duration-300"
        aria-label="Email"
      >
        <Mail className="w-5 h-5" />
      </a>
      <a
        href="tel:+447123456789"
        className="p-3 bg-brand-secondary rounded-full hover:bg-brand-secondary-hover transition-colors duration-300"
        aria-label="Phone"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
};
export default SocialBar;
