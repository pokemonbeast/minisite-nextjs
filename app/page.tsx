import { headers, cookies } from 'next/headers';
import { getMinisiteBySubdomain, getMinisitePage, getMinisiteArticles } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentRenderer } from '@/components/ContentRenderer';
import { notFound } from 'next/navigation';

export default async function HomePage() {
  const headersList = headers();
  const cookieStore = cookies();
  
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;
  
  if (!subdomain) {
    // No subdomain - show landing page or redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Minisite Platform</h1>
          <p className="text-gray-600">Enter a subdomain to view a site</p>
        </div>
      </div>
    );
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  
  if (!minisite) {
    notFound();
  }

  const homePage = await getMinisitePage(minisite.id, 'home');
  const articles = await getMinisiteArticles(minisite.id, 6);

  return (
    <>
      <Navigation minisite={minisite} />
      <main>
        {homePage ? (
          <ContentRenderer 
            blocks={homePage.content} 
            minisite={minisite}
            articles={articles}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4" style={{ color: minisite.primary_color }}>
                {minisite.name}
              </h1>
              <p className="text-gray-600">{minisite.description}</p>
            </div>
          </div>
        )}
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

