import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import { getMinisiteBySubdomain, getMinisitePage } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentRenderer } from '@/components/ContentRenderer';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;

  if (!subdomain) {
    return { title: 'About' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'About' };
  }

  const aboutPage = await getMinisitePage(minisite.id, 'about');

  return {
    title: aboutPage?.seo_title || `About ${minisite.name}`,
    description: aboutPage?.seo_description || `Learn more about ${minisite.name}. ${minisite.description}`,
    openGraph: {
      title: aboutPage?.seo_title || `About ${minisite.name}`,
      description: aboutPage?.seo_description || `Learn more about ${minisite.name}`,
      siteName: minisite.name,
      type: 'website',
      images: minisite.theme_config?.images?.about ? [minisite.theme_config.images.about] : [],
    },
  };
}

export default async function AboutPage() {
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

  const aboutPage = await getMinisitePage(minisite.id, 'about');

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-16">
        {aboutPage ? (
          <ContentRenderer 
            blocks={aboutPage.content} 
            minisite={minisite}
            articles={[]}
          />
        ) : (
          // Default about page if no custom content
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-8"
              style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
            >
              About {minisite.name}
            </h1>
            <div className="prose prose-lg">
              <p className="text-xl text-gray-600 mb-6">
                {minisite.description}
              </p>
              <p className="text-gray-600">
                We are dedicated to providing valuable content and resources to our audience. 
                Our mission is to inform, inspire, and engage our community with high-quality content.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

