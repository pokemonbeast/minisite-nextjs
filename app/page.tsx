import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getMinisiteBySubdomain, getMinisitePage, getMinisiteArticles, MinisiteArticle, Minisite } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentRenderer } from '@/components/ContentRenderer';
import { notFound } from 'next/navigation';

// Standalone Latest Articles component that always renders on homepage
function LatestArticlesSection({ 
  articles, 
  minisite 
}: { 
  articles: MinisiteArticle[]; 
  minisite: Minisite;
}) {
  if (articles.length === 0) {
    return null;
  }

  // Check if we should show link excerpts
  const themeConfig = minisite.theme_config || {};
  const includeExcerptLinks = themeConfig.contentSections?.includeExcerptLinks ?? false;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            Latest Articles
          </h2>
          <p className="text-gray-600 text-lg">
            Stay informed with our latest insights and updates
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => {
            const useHtmlExcerpt = includeExcerptLinks && article.link_excerpt;
            const excerptContent = useHtmlExcerpt ? article.link_excerpt : article.excerpt;
            
            return (
              <Link 
                key={article.id}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
              >
                {article.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 
                    className="text-lg font-semibold mb-2 group-hover:opacity-80 transition-opacity"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {article.title}
                  </h3>
                  {excerptContent && (
                    useHtmlExcerpt ? (
                      <div 
                        className="text-gray-600 text-sm mb-4 [&_a]:underline [&_a]:hover:opacity-80"
                        style={{ color: '#4b5563' }}
                        dangerouslySetInnerHTML={{ __html: excerptContent }}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{excerptContent}</p>
                    )
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500" suppressHydrationWarning>
                      {article.published_at && new Date(article.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: minisite.primary_color }}
                    >
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: minisite.primary_color, color: minisite.primary_color }}
            >
              View All Articles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;

  if (!subdomain) {
    return { title: 'Minisite Platform' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'Site Not Found' };
  }

  const homePage = await getMinisitePage(minisite.id, 'home');

  return {
    title: homePage?.seo_title || minisite.name,
    description: homePage?.seo_description || minisite.description,
    openGraph: {
      title: homePage?.seo_title || minisite.name,
      description: homePage?.seo_description || minisite.description,
      siteName: minisite.name,
      type: 'website',
      images: minisite.theme_config?.images?.hero ? [minisite.theme_config.images.hero] : [],
    },
  };
}

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
  const homepageArticlesCount = minisite.theme_config?.homepageArticlesCount || 6;
  const articles = await getMinisiteArticles(minisite.id, homepageArticlesCount);

  // Filter out blogroll blocks from page content - we'll render articles separately
  const contentBlocksWithoutBlogroll = homePage?.content?.filter(
    (block: any) => block.type !== 'blogroll'
  ) || [];

  return (
    <>
      <Navigation minisite={minisite} />
      <main>
        {homePage ? (
          <ContentRenderer 
            blocks={contentBlocksWithoutBlogroll} 
            minisite={minisite}
            articles={[]} // Don't pass articles to ContentRenderer, we handle them separately
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
        
        {/* Always show latest articles section on homepage */}
        <LatestArticlesSection articles={articles} minisite={minisite} />
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

