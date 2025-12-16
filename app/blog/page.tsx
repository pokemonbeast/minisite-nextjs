import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getMinisiteBySubdomain, getMinisiteArticles, getMinisitePage, MinisiteArticle, Minisite } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;

  if (!subdomain) {
    return { title: 'Blog' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'Blog' };
  }

  const blogPage = await getMinisitePage(minisite.id, 'blog');
  const themeConfig = minisite.theme_config || {};
  const blogLabel = themeConfig.blogLabel || 'Blog';

  return {
    title: blogPage?.seo_title || `${blogLabel} | ${minisite.name}`,
    description: blogPage?.seo_description || `Read the latest articles and insights from ${minisite.name}.`,
    openGraph: {
      title: blogPage?.seo_title || `${blogLabel} | ${minisite.name}`,
      description: blogPage?.seo_description || `Read the latest articles from ${minisite.name}`,
      siteName: minisite.name,
      type: 'website',
    },
  };
}

export default async function BlogPage() {
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

  const articles = await getMinisiteArticles(minisite.id);
  const themeConfig = minisite.theme_config || {};
  const layout = themeConfig.blogLayout || 'grid';
  const blogStyle = themeConfig.blogStyle || 'cards';
  const blogLabel = themeConfig.blogLabel || 'Blog';
  const includeExcerptLinks = themeConfig.contentSections?.includeExcerptLinks ?? false;

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-24 pb-16">
        <BlogHeader minisite={minisite} blogStyle={blogStyle} blogLabel={blogLabel} />
        <BlogArticles minisite={minisite} articles={articles} layout={layout} blogStyle={blogStyle} includeExcerptLinks={includeExcerptLinks} />
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

// Blog Header - Different styles
function BlogHeader({ minisite, blogStyle, blogLabel }: { minisite: Minisite; blogStyle: string; blogLabel: string }) {
  switch (blogStyle) {
    case 'minimal':
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 
            className="text-3xl font-light"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: 'var(--letter-spacing)' }}
          >
            {blogLabel}
          </h1>
        </div>
      );
    
    case 'magazine':
      return (
        <div 
          className="py-16 mb-8"
          style={{ backgroundColor: minisite.primary_color }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {blogLabel === 'Articles' ? 'Our Articles' : 'The Blog'}
            </h1>
            <p className="text-white/80 text-xl max-w-2xl">
              Insights, stories, and updates from {minisite.name}
            </p>
          </div>
        </div>
      );
    
    case 'compact':
      return (
        <div className="border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <h1 
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
            >
              {blogLabel === 'Articles' ? 'Latest Articles' : 'Latest Posts'}
            </h1>
            <span className="text-sm text-gray-500">All {blogLabel.toLowerCase()}</span>
          </div>
        </div>
      );
    
    default: // cards
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 
            className="mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--heading-weight)',
              color: minisite.primary_color 
            }}
          >
            {blogLabel}
          </h1>
          <p className="text-xl text-gray-600" style={{ lineHeight: 'var(--line-height)' }}>
            Insights, updates, and more from {minisite.name}
          </p>
        </div>
      );
  }
}

// Blog Articles - Different layout styles
function BlogArticles({ 
  minisite, 
  articles, 
  layout, 
  blogStyle,
  includeExcerptLinks
}: { 
  minisite: Minisite; 
  articles: MinisiteArticle[]; 
  layout: string;
  blogStyle: string;
  includeExcerptLinks: boolean;
}) {
  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500">No articles published yet.</p>
        </div>
      </div>
    );
  }

  switch (blogStyle) {
    case 'minimal':
      return <MinimalBlogList minisite={minisite} articles={articles} includeExcerptLinks={includeExcerptLinks} />;
    case 'magazine':
      return <MagazineBlogList minisite={minisite} articles={articles} layout={layout} includeExcerptLinks={includeExcerptLinks} />;
    case 'compact':
      return <CompactBlogList minisite={minisite} articles={articles} includeExcerptLinks={includeExcerptLinks} />;
    default:
      return <CardsBlogList minisite={minisite} articles={articles} layout={layout} includeExcerptLinks={includeExcerptLinks} />;
  }
}

// Cards Style Blog List
function CardsBlogList({ minisite, articles, layout, includeExcerptLinks }: { minisite: Minisite; articles: MinisiteArticle[]; layout: string; includeExcerptLinks: boolean }) {
  // Debug: log excerpt settings
  if (typeof window === 'undefined') {
    console.log('[Blog] includeExcerptLinks:', includeExcerptLinks);
    console.log('[Blog] First article link_excerpt:', articles[0]?.link_excerpt?.slice(0, 50));
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={
        layout === 'list' ? 'space-y-8' :
        layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-8' :
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
      }>
        {articles.map((article) => {
          const useHtmlExcerpt = includeExcerptLinks && article.link_excerpt;
          const excerptContent = useHtmlExcerpt ? article.link_excerpt : article.excerpt;
          
          return (
            <Link 
              key={article.id}
              href={`/blog/${article.slug}`}
              className={`card group ${layout === 'masonry' ? 'break-inside-avoid mb-8' : ''}`}
            >
              {article.featured_image && (
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 
                  className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {article.title}
                </h2>
                {excerptContent && (
                  useHtmlExcerpt ? (
                    <div 
                      className="text-gray-600 line-clamp-3 mb-4 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80"
                      dangerouslySetInnerHTML={{ __html: excerptContent }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-gray-600 line-clamp-3 mb-4">{excerptContent}</p>
                  )
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {article.published_at && new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span 
                    className="font-medium transition-colors"
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
    </div>
  );
}

// Minimal Style Blog List
function MinimalBlogList({ minisite, articles, includeExcerptLinks }: { minisite: Minisite; articles: MinisiteArticle[]; includeExcerptLinks: boolean }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="divide-y divide-gray-100">
        {articles.map((article) => {
          const useHtmlExcerpt = includeExcerptLinks && article.link_excerpt;
          const excerptContent = useHtmlExcerpt ? article.link_excerpt : article.excerpt;
          
          return (
            <Link 
              key={article.id}
              href={`/blog/${article.slug}`}
              className="block py-8 group"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <h2 
                    className="text-xl font-medium mb-2 group-hover:opacity-70 transition-opacity"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {article.title}
                  </h2>
                  {excerptContent && (
                    useHtmlExcerpt ? (
                      <div 
                        className="text-gray-500 line-clamp-2 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80"
                        dangerouslySetInnerHTML={{ __html: excerptContent }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-gray-500 line-clamp-2">{excerptContent}</p>
                    )
                  )}
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {article.published_at && new Date(article.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Magazine Style Blog List
function MagazineBlogList({ minisite, articles, layout, includeExcerptLinks }: { minisite: Minisite; articles: MinisiteArticle[]; layout: string; includeExcerptLinks: boolean }) {
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);
  
  const useFeaturedHtmlExcerpt = includeExcerptLinks && featuredArticle?.link_excerpt;
  const featuredExcerpt = useFeaturedHtmlExcerpt ? featuredArticle.link_excerpt : featuredArticle?.excerpt;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Featured Article */}
      {featuredArticle && (
        <Link 
          href={`/blog/${featuredArticle.slug}`}
          className="block mb-12 group"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {featuredArticle.featured_image && (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={featuredArticle.featured_image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div>
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                style={{ backgroundColor: minisite.accent_color }}
              >
                Featured
              </span>
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4 group-hover:opacity-80 transition-opacity"
                style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
              >
                {featuredArticle.title}
              </h2>
              {featuredExcerpt && (
                useFeaturedHtmlExcerpt ? (
                  <div 
                    className="text-gray-600 text-lg mb-4 line-clamp-3 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80"
                    dangerouslySetInnerHTML={{ __html: featuredExcerpt }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-gray-600 text-lg mb-4 line-clamp-3">{featuredExcerpt}</p>
                )
              )}
              <span className="text-sm text-gray-500">
                {featuredArticle.published_at && new Date(featuredArticle.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Remaining Articles */}
      {remainingArticles.length > 0 && (
        <div className={
          layout === 'list' ? 'space-y-6' :
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
        }>
          {remainingArticles.map((article) => (
            <Link 
              key={article.id}
              href={`/blog/${article.slug}`}
              className="block group"
            >
              {article.featured_image && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <h3 
                className="text-lg font-semibold mb-2 group-hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {article.title}
              </h3>
              <span className="text-sm text-gray-500">
                {article.published_at && new Date(article.published_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact Style Blog List
function CompactBlogList({ minisite, articles, includeExcerptLinks }: { minisite: Minisite; articles: MinisiteArticle[]; includeExcerptLinks: boolean }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {articles.map((article) => {
          const useHtmlExcerpt = includeExcerptLinks && article.link_excerpt;
          const excerptContent = useHtmlExcerpt ? article.link_excerpt : article.excerpt;
          
          return (
            <Link 
              key={article.id}
              href={`/blog/${article.slug}`}
              className="flex items-center gap-6 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {article.featured_image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-semibold mb-1 truncate group-hover:opacity-70 transition-opacity"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {article.title}
                </h3>
                {excerptContent && (
                  useHtmlExcerpt ? (
                    <div 
                      className="text-sm text-gray-500 line-clamp-1 [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: excerptContent }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 line-clamp-1">{excerptContent}</p>
                  )
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                {article.published_at && new Date(article.published_at).toLocaleDateString()}
              </span>
              <svg 
                className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
