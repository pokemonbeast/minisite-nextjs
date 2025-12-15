import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import { getMinisiteBySubdomain, getMinisitePage } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { ContentRenderer } from '@/components/ContentRenderer';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;

  if (!subdomain) {
    return { title: 'Contact' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'Contact' };
  }

  const contactPage = await getMinisitePage(minisite.id, 'contact');

  return {
    title: contactPage?.seo_title || `Contact ${minisite.name}`,
    description: contactPage?.seo_description || `Get in touch with ${minisite.name}. We'd love to hear from you.`,
    openGraph: {
      title: contactPage?.seo_title || `Contact ${minisite.name}`,
      description: contactPage?.seo_description || `Contact ${minisite.name}`,
      siteName: minisite.name,
      type: 'website',
    },
  };
}

export default async function ContactPage() {
  const headersList = headers();
  const cookieStore = cookies();
  
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;
  
  if (!subdomain) {
    notFound();
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  
  if (!minisite) {
    notFound();
  }

  const contactPage = await getMinisitePage(minisite.id, 'contact');

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-24 pb-16">
        {contactPage ? (
          <ContentRenderer 
            blocks={contactPage.content} 
            minisite={minisite}
            articles={[]}
          />
        ) : (
          // Default contact page if no custom content
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 py-12">
              {/* Left column - Info */}
              <div>
                <h1 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
                >
                  Contact Us
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${minisite.primary_color}15` }}
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: minisite.primary_color }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${minisite.primary_color}15` }}
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: minisite.primary_color }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Live Support</h3>
                      <p className="text-gray-600">Available during business hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <ContactForm minisite={minisite} />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

