'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minisite, MinisiteArticle, ContentBlock } from '@/lib/supabase';
import { ContactForm } from './ContactForm';

// Fallback placeholder images
const FALLBACK_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop&q=80',
  about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop&q=80',
  feature: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
  article: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=600&fit=crop&q=80',
};

// Safe Image component with error handling
function SafeImage({ 
  src, 
  alt, 
  fallbackType = 'feature',
  ...props 
}: { 
  src: string | undefined; 
  alt: string; 
  fallbackType?: 'hero' | 'about' | 'feature' | 'article';
  [key: string]: any;
}) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGES[fallbackType]);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGES[fallbackType]);
    }
  };

  if (!imgSrc) {
    return null;
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

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
    case 'testimonials':
      return <TestimonialsBlock data={block.data} minisite={minisite} />;
    case 'stats':
      return <StatsBlock data={block.data} minisite={minisite} />;
    case 'team':
      return <TeamBlock data={block.data} minisite={minisite} />;
    case 'faq':
      return <FAQBlock data={block.data} minisite={minisite} />;
    case 'timeline':
      return <TimelineBlock data={block.data} minisite={minisite} />;
    case 'pricing':
      return <PricingBlock data={block.data} minisite={minisite} />;
    case 'split':
      return <SplitBlock data={block.data} minisite={minisite} />;
    case 'banner':
      return <BannerBlock data={block.data} minisite={minisite} />;
    case 'logos':
      return <LogosBlock data={block.data} minisite={minisite} />;
    default:
      return null;
  }
}

// Hero Block - with actual different layouts for each style
function HeroBlock({ data, minisite, themeConfig }: { data: any; minisite: Minisite; themeConfig: any }) {
  const style = data.style || themeConfig.heroStyle || 'centered';
  const hasImage = !!data.backgroundImage;
  
  // SPLIT LAYOUT: Two columns - text left, image right
  if (style === 'split') {
    return (
      <section className="pt-16 min-h-[80vh] flex items-center bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Column */}
            <div className="order-2 md:order-1">
              <h1 
                className="mb-6"
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-h1)',
                  fontWeight: 'var(--heading-weight)',
                  letterSpacing: 'var(--letter-spacing)',
                  color: minisite.primary_color
                }}
              >
                {data.title}
              </h1>
              {data.subtitle && (
                <p 
                  className="mb-8 text-gray-600 max-w-xl"
                  style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', lineHeight: 'var(--line-height)' }}
                >
                  {data.subtitle}
                </p>
              )}
              {data.ctaText && (
                <Link
                  href={data.ctaLink || '#'}
                  className="btn-primary text-lg inline-block"
                  style={{ backgroundColor: minisite.accent_color }}
                >
                  {data.ctaText}
                </Link>
              )}
            </div>
            {/* Image Column */}
            <div className="order-1 md:order-2 relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              {hasImage ? (
                <SafeImage
                  src={data.backgroundImage}
                  alt={data.title || ''}
                  fill
                  fallbackType="hero"
                  className="object-cover"
                  priority
                />
              ) : (
                <div 
                  className="absolute inset-0" 
                  style={{ backgroundColor: minisite.secondary_color }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // MINIMAL LAYOUT: Simple text, no background image
  if (style === 'minimal') {
    return (
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="mb-6"
            style={{ 
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--heading-weight)',
              letterSpacing: 'var(--letter-spacing)',
              color: minisite.primary_color
            }}
          >
            {data.title}
          </h1>
          {data.subtitle && (
            <p 
              className="mb-8 text-gray-600 max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', lineHeight: 'var(--line-height)' }}
            >
              {data.subtitle}
            </p>
          )}
          {data.ctaText && (
            <Link
              href={data.ctaLink || '#'}
              className="btn-primary text-lg inline-block"
              style={{ backgroundColor: minisite.accent_color }}
            >
              {data.ctaText}
            </Link>
          )}
        </div>
      </section>
    );
  }
  
  // FULLWIDTH & CENTERED: Background image with text overlay
  const isFullwidth = style === 'fullwidth';
  
  return (
    <section 
      className={`relative pt-24 ${isFullwidth ? 'min-h-screen' : 'min-h-[70vh]'} flex items-center ${
        style === 'centered' ? 'justify-center text-center' : ''
      }`}
    >
      {/* Background Image */}
      {hasImage && (
        <>
          <div className="absolute inset-0">
            <SafeImage
              src={data.backgroundImage}
              alt=""
              fill
              fallbackType="hero"
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
          className={`mb-6 ${hasImage ? 'text-white' : ''}`}
          style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h1)',
            fontWeight: 'var(--heading-weight)',
            letterSpacing: 'var(--letter-spacing)',
            color: !hasImage ? minisite.primary_color : undefined
          }}
        >
          {data.title}
        </h1>
        {data.subtitle && (
          <p 
            className={`mb-8 max-w-2xl ${style === 'centered' ? 'mx-auto' : ''} ${hasImage ? 'text-gray-200' : 'text-gray-600'}`}
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', lineHeight: 'var(--line-height)' }}
          >
            {data.subtitle}
          </p>
        )}
        {data.ctaText && (
          <Link
            href={data.ctaLink || '#'}
            className="btn-primary text-lg inline-block"
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
  // Don't render if no image source
  if (!data.src) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-video rounded-2xl overflow-hidden">
          <SafeImage
            src={data.src}
            alt={data.alt || ''}
            fill
            fallbackType="about"
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
          className="mb-4"
          style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--heading-weight)',
            letterSpacing: 'var(--letter-spacing)'
          }}
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
            className="text-center mb-12"
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--heading-weight)',
              letterSpacing: 'var(--letter-spacing)',
              color: minisite.primary_color 
            }}
          >
            {data.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className="card p-6">
              {feature.image && (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <SafeImage
                    src={feature.image}
                    alt={feature.title || 'Feature'}
                    fill
                    fallbackType="feature"
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
  const includeExcerptLinks = themeConfig.contentSections?.includeExcerptLinks ?? false;
  
  const displayArticles = articles.slice(0, limit);
  
  if (displayArticles.length === 0) {
    return null;
  }

  // Helper to get the appropriate excerpt
  const getExcerpt = (article: MinisiteArticle) => {
    if (includeExcerptLinks && article.link_excerpt) {
      // Return the HTML with the link
      return article.link_excerpt;
    }
    // Return plain text excerpt
    return article.excerpt;
  };

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
          {displayArticles.map((article) => {
            const excerptContent = getExcerpt(article);
            const isHtmlExcerpt = includeExcerptLinks && article.link_excerpt;
            
            return (
              <Link 
                key={article.id}
                href={`/blog/${article.slug}`}
                className={`card group ${layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}
              >
                {article.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <SafeImage
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      fallbackType="article"
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
                  {excerptContent && (
                    isHtmlExcerpt ? (
                      <div 
                        className="text-gray-600 text-sm line-clamp-3 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80"
                        dangerouslySetInnerHTML={{ __html: excerptContent }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm line-clamp-2">{excerptContent}</p>
                    )
                  )}
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>
                      {article.published_at && new Date(article.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
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

// Testimonials Block
function TestimonialsBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const testimonials = data.items || [];
  const layout = data.layout || 'cards'; // cards, carousel, list, quote
  
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-center mb-4"
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--heading-weight)',
              letterSpacing: 'var(--letter-spacing)',
              color: minisite.primary_color 
            }}
          >
            {data.title}
          </h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{data.subtitle}</p>
        )}
        
        {layout === 'quote' && testimonials[0] && (
          <div className="max-w-4xl mx-auto text-center">
            <svg className="w-12 h-12 mx-auto mb-6 opacity-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <blockquote className="text-2xl md:text-3xl italic text-gray-700 mb-8">
              "{testimonials[0].quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              {testimonials[0].avatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <SafeImage src={testimonials[0].avatar} alt={testimonials[0].name} fill fallbackType="feature" className="object-cover" />
                </div>
              )}
              <div>
                <p className="font-semibold" style={{ color: minisite.primary_color }}>{testimonials[0].name}</p>
                {testimonials[0].role && <p className="text-gray-500 text-sm">{testimonials[0].role}</p>}
              </div>
            </div>
          </div>
        )}
        
        {layout === 'cards' && (
          <div className={`grid gap-8 ${testimonials.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  {t.avatar && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <SafeImage src={t.avatar} alt={t.name} fill fallbackType="feature" className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    {t.role && <p className="text-gray-500 text-sm">{t.role}</p>}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{t.quote}"</p>
                {t.rating && (
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-5 h-5 ${j < t.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {layout === 'list' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="flex gap-6 items-start">
                {t.avatar && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <SafeImage src={t.avatar} alt={t.name} fill fallbackType="feature" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-gray-700 italic mb-3">"{t.quote}"</p>
                  <p className="font-semibold" style={{ color: minisite.primary_color }}>{t.name}</p>
                  {t.role && <p className="text-gray-500 text-sm">{t.role}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Stats/Numbers Block
function StatsBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const stats = data.items || [];
  const layout = data.layout || 'row'; // row, grid, cards
  
  if (stats.length === 0) return null;

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: data.bgColor === 'primary' ? minisite.primary_color : undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className={`text-center mb-12 ${data.bgColor === 'primary' ? 'text-white' : ''}`}
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--heading-weight)',
              letterSpacing: 'var(--letter-spacing)',
              color: data.bgColor !== 'primary' ? minisite.primary_color : undefined 
            }}
          >
            {data.title}
          </h2>
        )}
        
        <div className={`
          ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-8' : ''}
          ${layout === 'row' ? 'flex flex-wrap justify-center gap-12 md:gap-20' : ''}
          ${layout === 'cards' ? 'grid grid-cols-2 md:grid-cols-4 gap-6' : ''}
        `}>
          {stats.map((stat: any, i: number) => (
            <div 
              key={i} 
              className={`text-center ${layout === 'cards' ? 'card p-6' : ''}`}
            >
              <div 
                className={`mb-2 ${data.bgColor === 'primary' ? 'text-white' : ''}`}
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--heading-weight)',
                  color: data.bgColor !== 'primary' ? minisite.accent_color : undefined 
                }}
              >
                {stat.value}
              </div>
              <div className={`${data.bgColor === 'primary' ? 'text-white/80' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Team Block
function TeamBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const members = data.items || [];
  const layout = data.layout || 'grid'; // grid, cards, list
  
  if (members.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{data.subtitle}</p>
        )}
        
        <div className={`grid gap-8 ${
          members.length <= 3 ? 'md:grid-cols-3' : 
          members.length === 4 ? 'md:grid-cols-4' : 
          'md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {members.map((member: any, i: number) => (
            <div key={i} className={`text-center ${layout === 'cards' ? 'card p-6' : ''}`}>
              {member.image && (
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <SafeImage src={member.image} alt={member.name} fill fallbackType="feature" className="object-cover" />
                </div>
              )}
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{member.name}</h3>
              {member.role && (
                <p className="text-sm mb-2" style={{ color: minisite.accent_color }}>{member.role}</p>
              )}
              {member.bio && <p className="text-gray-600 text-sm">{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Block
function FAQBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = data.items || [];
  const layout = data.layout || 'accordion'; // accordion, grid, simple
  
  if (faqs.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-12">{data.subtitle}</p>
        )}
        
        {layout === 'accordion' && (
          <div className="space-y-4">
            {faqs.map((faq: any, i: number) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {layout === 'grid' && (
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq: any, i: number) => (
              <div key={i} className="card p-6">
                <h3 className="font-semibold mb-2" style={{ color: minisite.primary_color }}>{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {layout === 'simple' && (
          <div className="space-y-8">
            {faqs.map((faq: any, i: number) => (
              <div key={i}>
                <h3 className="font-semibold text-lg mb-2" style={{ color: minisite.primary_color }}>{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Timeline Block
function TimelineBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const items = data.items || [];
  
  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        
        <div className="relative">
          <div 
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -ml-px"
            style={{ backgroundColor: minisite.primary_color, opacity: 0.2 }}
          />
          
          <div className="space-y-12">
            {items.map((item: any, i: number) => (
              <div key={i} className={`relative flex items-start gap-6 md:gap-12 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div 
                  className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full -ml-1.5 mt-2"
                  style={{ backgroundColor: minisite.accent_color }}
                />
                <div className={`flex-1 ml-12 md:ml-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  {item.date && (
                    <span className="text-sm font-medium" style={{ color: minisite.accent_color }}>{item.date}</span>
                  )}
                  <h3 className="font-semibold text-lg mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                  {item.description && <p className="text-gray-600 mt-2">{item.description}</p>}
                </div>
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Block
function PricingBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const plans = data.items || [];
  
  if (plans.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {data.title}
          </h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{data.subtitle}</p>
        )}
        
        <div className={`grid gap-8 ${plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
          {plans.map((plan: any, i: number) => (
            <div 
              key={i} 
              className={`card p-8 ${plan.featured ? 'ring-2 relative' : ''}`}
              style={plan.featured ? { borderColor: minisite.accent_color } : undefined}
            >
              {plan.featured && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: minisite.accent_color }}
                >
                  Most Popular
                </div>
              )}
              <h3 className="font-semibold text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{plan.name}</h3>
              {plan.description && <p className="text-gray-600 text-sm mb-4">{plan.description}</p>}
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: minisite.primary_color }}>{plan.price}</span>
                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
              </div>
              {plan.features && (
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, j: number) => (
                    <li key={j} className="flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: minisite.accent_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={plan.ctaLink || '/contact'}
                className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.featured 
                    ? 'text-white' 
                    : 'border-2 hover:bg-gray-50'
                }`}
                style={plan.featured 
                  ? { backgroundColor: minisite.accent_color }
                  : { borderColor: minisite.primary_color, color: minisite.primary_color }
                }
              >
                {plan.ctaText || 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Split Content Block (image + text side by side)
function SplitBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const imagePosition = data.imagePosition || 'left';
  
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${imagePosition === 'right' ? '' : 'md:flex-row-reverse'}`}>
          <div className={imagePosition === 'right' ? 'md:order-1' : 'md:order-2'}>
            {data.image && (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <SafeImage src={data.image} alt={data.title || ''} fill fallbackType="about" className="object-cover" />
              </div>
            )}
          </div>
          <div className={imagePosition === 'right' ? 'md:order-2' : 'md:order-1'}>
            {data.eyebrow && (
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: minisite.accent_color }}>
                {data.eyebrow}
              </span>
            )}
            {data.title && (
              <h2 
                className="mt-2 mb-4"
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--heading-weight)',
                  letterSpacing: 'var(--letter-spacing)',
                  color: minisite.primary_color 
                }}
              >
                {data.title}
              </h2>
            )}
            {data.content && (
              <div className="text-gray-600 space-y-4" dangerouslySetInnerHTML={{ __html: data.content }} />
            )}
            {data.ctaText && (
              <Link
                href={data.ctaLink || '#'}
                className="inline-flex items-center gap-2 mt-6 font-medium"
                style={{ color: minisite.accent_color }}
              >
                {data.ctaText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Banner Block (full-width promotional section)
function BannerBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const variant = data.variant || 'gradient'; // gradient, image, solid
  
  return (
    <section 
      className="py-16 relative overflow-hidden"
      style={variant === 'solid' ? { backgroundColor: minisite.primary_color } : undefined}
    >
      {variant === 'gradient' && (
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${minisite.primary_color} 0%, ${minisite.secondary_color} 100%)`
          }}
        />
      )}
      {variant === 'image' && data.backgroundImage && (
        <>
          <div className="absolute inset-0">
            <SafeImage src={data.backgroundImage} alt="" fill fallbackType="hero" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {data.eyebrow && (
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
            {data.eyebrow}
          </span>
        )}
        {data.title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {data.title}
          </h2>
        )}
        {data.description && (
          <p className="text-xl opacity-90 mb-8">{data.description}</p>
        )}
        {data.ctaText && (
          <Link
            href={data.ctaLink || '#'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-lg font-medium transition-transform hover:scale-105"
            style={{ color: minisite.primary_color }}
          >
            {data.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}

// Client/Partner Logos Block
function LogosBlock({ data, minisite }: { data: any; minisite: Minisite }) {
  const logos = data.items || [];
  
  if (logos.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <p className="text-center text-gray-500 mb-8">{data.title}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo: any, i: number) => (
            <div key={i} className="relative h-12 w-32 grayscale hover:grayscale-0 transition-all">
              <SafeImage src={logo.src} alt={logo.alt || ''} fill fallbackType="feature" className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

