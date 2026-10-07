'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { cormorant } from '@/app/fonts';
import { sendContactEmail } from '@/lib/actions/contact.actions';

export default function EducationQuestionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const inputClassName = 'w-full px-4 py-3 bg-white text-text-primary border-2 border-border-default rounded shadow-sm focus:border-interactive-focus focus:outline-none transition-colors';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await sendContactEmail({
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        service: 'Education & Salon Support',
        message: String(formData.get('message') || '').trim(),
      });

      setFeedback({
        success: result.success,
        message: result.success
          ? result.message || "Thank you! I'll get back to you within 24 hours."
          : result.error || 'Something went wrong. Please try again.',
      });
      if (result.success) form.reset();
    } catch {
      setFeedback({
        success: false,
        message: 'Failed to send your question. Please try emailing hello@victoriablushcollections.co.uk directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="ask-a-question" aria-labelledby="ask-a-question-heading" className="py-24 bg-linear-to-b from-bg-subtle to-bg-primary">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <div aria-hidden="true" className="flex items-center justify-center gap-4 mb-5 text-interactive-active">
            <span className="h-px w-12 bg-border-emphasis" />
            <MessageCircle className="w-8 h-8" strokeWidth={1.5} />
            <span className="h-px w-12 bg-border-emphasis" />
          </div>
          <h2 id="ask-a-question-heading" className={`${cormorant.className} text-4xl md:text-5xl font-medium text-text-primary leading-tight mb-5`}>
            Ask A Question
          </h2>
          <p className="max-w-lg mx-auto text-base md:text-lg leading-loose text-text-secondary">
            Not quite sure where to start? I'd love to hear from you. Tell me a little about what's on your mind, and let's find the right next step for you.
          </p>
        </div>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="space-y-6 min-w-0">
            <div>
              <label htmlFor="education-name" className="block text-sm font-semibold text-text-primary mb-2">
                Your Name *
              </label>
              <input id="education-name" name="name" type="text" autoComplete="name" required className={inputClassName} placeholder="Please enter your full name" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="education-email" className="block text-sm font-semibold text-text-primary mb-2">
                  Email *
                </label>
                <input id="education-email" name="email" type="email" autoComplete="email" required className={inputClassName} placeholder="email@example.com" />
              </div>
              <div>
                <label htmlFor="education-phone" className="block text-sm font-semibold text-text-primary mb-2">
                  Phone
                </label>
                <input id="education-phone" name="phone" type="tel" autoComplete="tel" className={inputClassName} placeholder="07123 456 789" />
              </div>
            </div>
            <div>
              <label htmlFor="education-message" className="block text-sm font-semibold text-text-primary mb-2">
                Your Question *
              </label>
              <textarea id="education-message" name="message" required rows={4} className={`${inputClassName} resize-y`} placeholder="What would you like to know?" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-8 py-4 bg-interactive-active hover:bg-interactive-active/90 text-brand-primary font-semibold rounded transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" /> : <Send aria-hidden="true" className="w-5 h-5" />}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </fieldset>
          {feedback && (
            <p role={feedback.success ? 'status' : 'alert'} className={`mt-6 p-4 border-2 rounded-lg text-center font-medium ${feedback.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {feedback.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}