import { Mail, Phone, Heart } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { Logo } from './shared/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="mb-6 w-54" forceTheme='dark' />
            {/* <h3 className="text-3xl font-semibold mb-4">
              Victoria Blush <span className="text-brand-secondary font-bold">Collections</span>
            </h3> */}
            <p className="text-text-muted mb-6 leading-relaxed">
              Where hair artistry meets individuality. Creating beautiful, lived-in looks
              that make you feel confident.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/victoriablushcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-brand-primary rounded-full hover:bg-interactive-active transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/victoriablushcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-brand-primary rounded-full hover:bg-interactive-active transition-colors duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@victoriablush.com"
                className="p-3 bg-brand-primary rounded-full hover:bg-interactive-active transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="tel:+447123456789"
                className="p-3 bg-brand-primary rounded-full hover:bg-interactive-active transition-colors duration-300"
                aria-label="Phone"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-text-muted hover:text-white transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#prices" className="text-text-muted hover:text-white transition-colors">
                  Services & Prices
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-text-muted hover:text-white transition-colors">
                  Gallery Showcase
                </a>
              </li>
              <li>
                <a href="#contact" className="text-text-muted hover:text-white transition-colors">
                  Book An Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-text-muted">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="font-medium">9AM - 5PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">9AM - 3PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-stone-300">CLOSED</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-primary">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-sm text-center md:text-left">
              © {currentYear} Pixel Squirrel Studios. All rights reserved.
            </p>

            {/* Single inline line; no flex */}
            <p className="max-sm:px-8 text-text-muted text-sm text-center md:text-right">
              <span className="text-brand-secondary whitespace-nowrap">
                Victoria Blush Collections Limited
              </span>{' '}
              is a company registered in England and Wales with the company number{' '}
              <span className="font-bold whitespace-nowrap">16268010</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
