'use client';

import { useState } from 'react';
import { Minisite, submitContactForm } from '@/lib/supabase';

interface ContactFormProps {
  minisite: Minisite;
}

export function ContactForm({ minisite }: ContactFormProps) {
  const themeConfig = minisite.theme_config || {};
  const contactLayout = themeConfig.contactLayout || 'standard';

  switch (contactLayout) {
    case 'split':
      return <SplitContactForm minisite={minisite} />;
    case 'minimal':
      return <MinimalContactForm minisite={minisite} />;
    case 'card':
      return <CardContactForm minisite={minisite} />;
    default:
      return <StandardContactForm minisite={minisite} />;
  }
}

// Shared form logic hook
function useContactForm(minisite: Minisite) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await submitContactForm({
        ...formData,
        minisite_id: minisite.id,
      });

      if (success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setError('Failed to submit form. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, isSubmitting, isSubmitted, error, handleChange, handleSubmit, setIsSubmitted };
}

// Success message component
function SuccessMessage({ minisite, onReset }: { minisite: Minisite; onReset: () => void }) {
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: minisite.primary_color }}
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 
        className="text-2xl font-bold text-gray-900 mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Thank You!
      </h3>
      <p className="text-gray-600">We've received your message and will get back to you soon.</p>
      <button
        onClick={onReset}
        className="mt-6 text-sm hover:underline"
        style={{ color: minisite.primary_color }}
      >
        Send another message
      </button>
    </div>
  );
}

// Standard Contact Form
function StandardContactForm({ minisite }: { minisite: Minisite }) {
  const { formData, isSubmitting, isSubmitted, error, handleChange, handleSubmit, setIsSubmitted } = useContactForm(minisite);

  if (isSubmitted) {
    return <SuccessMessage minisite={minisite} onReset={() => setIsSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
          placeholder="(123) 456-7890"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="form-input resize-none"
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: minisite.primary_color }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}

// Split Contact Form - Two columns: Name/Email on left, Message on right
function SplitContactForm({ minisite }: { minisite: Minisite }) {
  const { formData, isSubmitting, isSubmitted, error, handleChange, handleSubmit, setIsSubmitted } = useContactForm(minisite);

  if (isSubmitted) {
    return <SuccessMessage minisite={minisite} onReset={() => setIsSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="form-input resize-none flex-1 min-h-[200px]"
            placeholder="Tell us about your project or inquiry..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
          style={{ backgroundColor: minisite.accent_color }}
        >
          {isSubmitting ? 'Sending...' : 'Send Message →'}
        </button>
      </div>
    </form>
  );
}

// Minimal Contact Form - Clean and simple
function MinimalContactForm({ minisite }: { minisite: Minisite }) {
  const { formData, isSubmitting, isSubmitted, error, handleChange, handleSubmit, setIsSubmitted } = useContactForm(minisite);

  if (isSubmitted) {
    return <SuccessMessage minisite={minisite} onReset={() => setIsSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="space-y-6">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border-0 border-b-2 border-gray-200 px-0 py-3 text-lg focus:border-gray-900 focus:ring-0 transition-colors bg-transparent"
          placeholder="Your name *"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border-0 border-b-2 border-gray-200 px-0 py-3 text-lg focus:border-gray-900 focus:ring-0 transition-colors bg-transparent"
          placeholder="Email address *"
        />

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border-0 border-b-2 border-gray-200 px-0 py-3 text-lg focus:border-gray-900 focus:ring-0 transition-colors bg-transparent"
          placeholder="Phone (optional)"
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border-0 border-b-2 border-gray-200 px-0 py-3 text-lg focus:border-gray-900 focus:ring-0 transition-colors resize-none bg-transparent"
          placeholder="Your message *"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
        style={{ color: minisite.primary_color }}
      >
        {isSubmitting ? 'Sending...' : (
          <>
            Submit
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

// Card Contact Form - Form inside a card with colored header
function CardContactForm({ minisite }: { minisite: Minisite }) {
  const { formData, isSubmitting, isSubmitted, error, handleChange, handleSubmit, setIsSubmitted } = useContactForm(minisite);

  if (isSubmitted) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-xl">
        <div 
          className="p-8 text-white text-center"
          style={{ backgroundColor: minisite.primary_color }}
        >
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Message Sent!</h3>
          <p className="opacity-90">We'll get back to you as soon as possible.</p>
        </div>
        <div className="p-8 bg-white text-center">
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm hover:underline"
            style={{ color: minisite.primary_color }}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl">
      <div 
        className="p-8 text-white"
        style={{ backgroundColor: minisite.primary_color }}
      >
        <h3 
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Send us a message
        </h3>
        <p className="opacity-90">Fill out the form below and we'll respond promptly.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="sr-only">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
              style={{ '--tw-ring-color': minisite.primary_color } as any}
              placeholder="Name *"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
              style={{ '--tw-ring-color': minisite.primary_color } as any}
              placeholder="Email *"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="sr-only">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
            style={{ '--tw-ring-color': minisite.primary_color } as any}
            placeholder="Phone (optional)"
          />
        </div>

        <div>
          <label htmlFor="message" className="sr-only">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors resize-none"
            style={{ '--tw-ring-color': minisite.primary_color } as any}
            placeholder="Your message *"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          style={{ backgroundColor: minisite.accent_color }}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
