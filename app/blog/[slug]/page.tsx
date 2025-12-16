import { headers, cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { getMinisiteBySubdomain, getMinisiteArticle, getMinisiteArticles } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers();
  const cookieStore = cookies();
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;
  
  if (!subdomain) {
    return { title: 'Article Not Found' };
  }

  const minisite = await getMinisiteBySubdomain(subdomain);
  if (!minisite) {
    return { title: 'Article Not Found' };
  }

  const article = await getMinisiteArticle(minisite.id, params.slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || '',
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
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

  const article = await getMinisiteArticle(minisite.id, params.slug);
  
  if (!article) {
    notFound();
  }

  // Get related articles (excluding current)
  const allArticles = await getMinisiteArticles(minisite.id, 4);
  const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <>
      <Navigation minisite={minisite} />
      <main className="pt-24 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/blog" className="hover:text-gray-700">Blog</Link>
              <span>/</span>
              <span>{article.title.slice(0, 30)}...</span>
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-gray-500">
              {article.published_at && (
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="relative aspect-video mb-10 rounded-2xl overflow-hidden">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Back to Blog */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
            <h2 
              className="text-2xl font-bold mb-8"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="card group"
                >
                  {related.featured_image && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={related.featured_image}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 
                      className="font-semibold group-hover:text-primary transition-colors"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer minisite={minisite} />
    </>
  );
}


