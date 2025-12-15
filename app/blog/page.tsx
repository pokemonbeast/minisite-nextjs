import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { getMinisiteBySubdomain, getMinisiteArticles } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';

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

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Insights, updates, and more from {minisite.name}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No articles published yet.</p>
            </div>
          ) : (
            <div className={
              layout === 'list' ? 'space-y-8' :
              layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-8' :
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            }>
              {articles.map((article) => (
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
                    {article.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer minisite={minisite} />
    </>
  );
}

