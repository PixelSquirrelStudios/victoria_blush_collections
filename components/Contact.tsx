'use client';

import { cormorant } from '@/app/fonts';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaInstagram, FaRegClock } from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitMessage('Thank you! I\'ll get back to you within 24 hours.');
    setIsSubmitting(false);

    // Reset form
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      setSubmitMessage('');
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-24 bg-linear-to-b from-bg-subtle to-bg-primary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-text-primary tracking-widest uppercase mb-4">
            Get In Touch
          </p>
          <h2 className={`${cormorant.className} text-4xl md:text-5xl font-medium uppercase text-text-primary mb-6`}>
            Book Your Appointment
          </h2>
          <p className="text-lg text-text-body font-light">
            Ready for a transformation? Let's create something beautiful together.
          </p>

          <Link href="https://victoria-blush-collections-limited.book.app/book-now" target="_blank" rel="noopener noreferrer">
            <div className='w-full flex justify-center'>
              <div className='mt-6 flex flex-row items-center w-72 justify-center px-8 py-4 bg-interactive-active text-brand-primary font-medium tracking-wide rounded-full hover:bg-interactive-active/90 transition-all duration-300 shadow-lg hover:shadow-xl text-center'>
                <FaRegClock className="inline w-5 h-5 mr-2" />
                <div>
                  Book Now With Ovatu
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                Contact Information
              </h3>
              <div className="space-y-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <MapPin className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Location</p>
                    <p className="text-text-body">
                      Bodi Studios, Unit 8,<br />
                      Wilcox House,<br />
                      Cardiff CF11 0BA
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <Phone className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Phone</p>
                    <a href="tel:07946722683" className="text-text-body hover:text-text-primary transition-colors">
                      07946 722 683
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <Mail className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Email</p>
                    <a href="mailto:hello@victoriablushcollections.com" className="text-text-body hover:text-text-primary transition-colors">
                      hello@victoriablushcollections.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <Clock className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Opening Hours</p>
                    <div className="text-text-body space-y-1">
                      <p>Monday & Tuesday: 9:00 AM - 7:00 PM (Alternating Weeks)</p>
                      <p>Wednesday: 9:00 AM - 7:00 PM</p>
                      <p>Thursday: CLOSED</p>
                      <p>Friday: 9:00 AM - 5:00 PM</p>
                      <p>Saturday: 8:00 AM - 4:00 PM</p>
                      <p>Sunday: CLOSED</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-muted rounded-lg">
                    <FaInstagram className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Social Media</p>
                    <a
                      href="https://instagram.com/victoriablushcollections"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-body hover:text-text-primary transition-colors"
                    >
                      @victoriablushcollections
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            {/* <div className="rounded-lg overflow-hidden shadow-lg h-64 bg-stone-200">
              <div className="w-full h-full flex items-center justify-center text-stone-500"> */}
            {/* Replace with actual Google Maps embed */}
            {/* <MapPin className="w-12 h-12" />
              </div>
            </div> */}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              General Enquiries
            </h3>
            <div className='bg-bg-primary rounded-lg shadow-xl p-8'>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-border-default rounded focus:border-interactive-focus focus:outline-none transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-border-default rounded focus:border-interactive-focus focus:outline-none transition-colors"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border-default rounded focus:border-interactive-focus focus:outline-none transition-colors"
                      placeholder="+44 7123 456789"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-text-primary mb-2">
                    Service Interested In *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-border-default rounded focus:border-interactive-focus focus:outline-none transition-colors"
                  >
                    <option value="">Select a service</option>
                    <option value="cut-finish">Cut and Finish</option>
                    <option value="blowdry">Blow Dry & Styling</option>
                    <option value="balayage">Full Lived In / Balayage</option>
                    <option value="maintenance">Maintenance Lived In</option>
                    <option value="full-foils">Full Head Foils</option>
                    <option value="half-foils">Half Head Foils</option>
                    <option value="global-color">Global Colour</option>
                    <option value="roots">Global Roots</option>
                    <option value="toning">Toning Service</option>
                    <option value="correction">Colour Correction</option>
                    <option value="treatments">Hair Treatments</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-border-default rounded focus:border-interactive-focus focus:outline-none transition-colors resize-none"
                    placeholder="Tell me about your hair goals..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-interactive-active hover:bg-interactive-active/90 text-brand-primary font-semibold rounded hover:text-shadow-text-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                {submitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-800 text-center font-medium"
                  >
                    {submitMessage}
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
