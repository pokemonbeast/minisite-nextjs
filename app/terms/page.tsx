import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import { getMinisiteBySubdomain, getMinisitePage } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;

  if (!subdomain) {
    return { title: 'Terms of Service' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'Terms of Service' };
  }

  return {
    title: `Terms of Service | ${minisite.name}`,
    description: `Terms of service and conditions for using ${minisite.name}.`,
  };
}

export default async function TermsPage() {
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

  const termsPage = await getMinisitePage(minisite.id, 'terms');

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 
            className="mb-8"
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--heading-weight)',
              color: minisite.primary_color 
            }}
          >
            Terms of Service
          </h1>
          
          {termsPage ? (
            <div className="article-content">
              {termsPage.content.map((block: any, index: number) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: block.data?.content || '' }} />
              ))}
            </div>
          ) : (
            <div className="article-content">
              <p className="text-gray-500">Terms of service content is being prepared.</p>
            </div>
          )}
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </main>
      <Footer minisite={minisite} />
    </>
  );
}


