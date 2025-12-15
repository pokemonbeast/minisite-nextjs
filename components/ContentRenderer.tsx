'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minisite, MinisiteArticle, ContentBlock } from '@/lib/supabase';
import { ContactForm } from './ContactForm';

interface ContentRendererProps {
  blocks: ContentBlock[];
  minisite: Minisite;
  articles?: MinisiteArticle[];
}

export function ContentRenderer({ blocks, minisite, articles = [] }: ContentRendererProps) {
  return (
    <div>
      {blocks.map((block, index) => (
        <BlockRenderer 
          key={index} 
          block={block} 
          minisite={minisite}
          articles={articles}
        />
      ))}
    </div>
  );
}

interface BlockRendererProps {
  block: ContentBlock;
  minisite: Minisite;
  articles: MinisiteArticle[];
}

function BlockRenderer({ block, minisite, articles }: BlockRendererProps) {
  const themeConfig = minisite.theme_config || {};

  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data} minisite={minisite} themeConfig={themeConfig} />;
    case 'text':
      return <TextBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} />;
    case 'cta':
      return <CTABlock data={block.data} minisite={minisite} />;
    case 'features':
      return <FeaturesBlock data={block.data} minisite={minisite} />;
    case 'blogroll':
      return <BlogrollBlock data={block.data} minisite={minisite} articles={articles} />;
    case 'contact':
      return <ContactBlock data={block.data} minisite={minisite} />;
    default:
      return null;
  }
}

// Hero Block
function HeroBlock({ data, minisite, themeConfig }: { data: any; minisite: Minisite; themeConfig: any }) {
  const style = data.style || themeConfig.heroStyle || 'centered';
  
  return (
    <section 
      className={`relative pt-24 ${
        style === 'fullwidth' ? 'min-h-screen' : 
        style === 'minimal' ? 'py-20' : 'min-h-[70vh]'
      } flex items-center`}
    >
      {/* Background Image */}
      {data.backgroundImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={data.backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        </>
      )}
      
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${
        style === 'centered' ? 'text-center' : ''
      }`}>
        <h1 
          className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
            data.backgroundImage ? 'text-white' : ''
          }`}
          style={{ 
            fontFamily: 'var(--font-heading)',
            color: !data.backgroundImage ? minisite.primary_color : undefined
          }}
        >
          {data.title}
        </h1>
        {data.subtitle && (
          <p className={`text-xl md:text-2xl mb-8 max-w-2xl ${
            style === 'centered' ? 'mx-auto' : ''
          } ${data.backgroundImage ? 'text-gray-200' : 'text-gray-600'}`}>
            {data.subtitle}
          </p>
        )}
        {data.ctaText && (
          <Link
            href={data.ctaLink || '#'}
            className="btn-primary text-lg"
            style={{ backgroundColor: minisite.accent_color }}
          >
            {data.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}

// Text Block
function TextBlock({ data }: { data: any }) {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </section>
  );
}

// Image Block
function ImageBlock({ data }: { data: any }) {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-video rounded-2xl overflow-hidden">
          <Image
            src={data.src}
            alt={data.alt || ''}
            fill
            className="object-cover"
          />
        </div>
        {data.caption && (
          <p className="text-center text-gray-500 mt-4">{data.caption}</p>
        )}
      </div>
    </section>
  );
}

// CTA Block
function CTABlock({ data, minisite }: { data: any; minisite: Minisite }) {
  return (
    <section 
      className="py-20"
      style={{ backgroundColor: minisite.primary_color }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {data.title}
        </h2>
        {data.description && (
          <p className="text-xl opacity-90 mb-8">{data.description}</p>
        )}
        {data.buttonText && (
          <Link
            href={data.buttonLink || '/contact'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-lg font-medium transition-transform hover:scale-105"
            style={{ color: minisite.primary_color }}
          >
            {data.buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}
      </div>
    </section>
  );
}

// Features Block
function FeaturesBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const features = data.items || [];
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className="card p-6">
              {feature.image && (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Blogroll Block
function BlogrollBlock({ data, minisite, articles }: { data: any; minisite: Minisite; articles: MinisiteArticle[] }) {
  const themeConfig = minisite.theme_config || {};
  const layout = data.layout || themeConfig.blogLayout || 'grid';
  const limit = data.limit || 6;
  
  const displayArticles = articles.slice(0, limit);
  
  if (displayArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        <div className={
          layout === 'list' ? 'space-y-6' :
          layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' :
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }>
          {displayArticles.map((article) => (
            <Link 
              key={article.id}
              href={`/blog/${article.slug}`}
              className={`card group ${layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}
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
              <div className="p-5">
                <h3 
                  className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                )}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>
                    {article.published_at && new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="btn-secondary"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}

// Contact Block
function ContactBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactForm minisite={minisite} />
      </div>
    </section>
  );
}

