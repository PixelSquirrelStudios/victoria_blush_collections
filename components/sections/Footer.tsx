import { Mail, Phone, Heart } from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { Logo } from '../shared/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-text-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="mb-6 w-54" forceTheme='light' />
            {/* <h3 className="text-3xl font-semibold mb-4">
              Victoria Blush <span className="text-brand-secondary font-bold">Collections</span>
            </h3> */}
            <div className='flex flex-col gap-1'>
              <p className="text-text-primary leading-relaxed font-light">
                Where hair artistry meets individuality.
              </p>
              <p className="text-text-primary mb-6 leading-relaxed font-light">Creating beautiful, lived-in looks
                that make you feel truly confident.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/victoriablushcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-brand-primary rounded-full hover:bg-brand-primary-hover transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/victoriablushcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-brand-primary rounded-full hover:bg-brand-primary-hover transition-colors duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@victoriablush.com"
                className="p-3 bg-brand-primary rounded-full hover:bg-brand-primary-hover transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="tel:+447123456789"
                className="p-3 bg-brand-primary rounded-full hover:bg-brand-primary-hover transition-colors duration-300"
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
                <a href="#about" className="text-text-primary hover:text-text-primary/80 transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#prices" className="text-text-primary hover:text-text-primary/80 transition-colors">
                  Services & Prices
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-text-primary hover:text-text-primary/80 transition-colors">
                  Gallery Showcase
                </a>
              </li>
              <li>
                <a href="#contact" className="text-text-primary hover:text-text-primary/80 transition-colors">
                  Book An Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-text-primary">
              <li className="flex justify-between">
                <span>Mon & Tue</span>
                <span className="font-medium">9AM - 7PM (Alt Weeks)</span>
              </li>
              <li className="flex justify-between">
                <span>Weds</span>
                <span className="font-medium">9AM - 7PM</span>
              </li>
              <li className="flex justify-between">
                <span>Fri</span>
                <span className="font-medium text-text-primary">9AM - 5PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sat</span>
                <span className="font-medium text-text-primary">8AM - 4PM</span>
              </li>
              <li className="flex justify-between">
                <span>Thurs & Sun</span>
                <span className="font-medium text-text-primary">CLOSED</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-text-muted">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-primary text-sm text-center md:text-left">
              © {currentYear} Pixel Squirrel Studios. All rights reserved.
            </p>

            {/* Single inline line; no flex */}
            <p className="max-sm:px-8 text-text-primary text-sm text-center md:text-right">
              <span className="text-text-primary font-semibold whitespace-nowrap">
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
