import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';

const SITEMAP_TTL_SECONDS = 3600; // match lib/supabase.ts public data cache

// Cache the minisite-by-subdomain lookup specifically for the sitemap so we
// only need slug + timestamp columns. Tagged so the dashboard can invalidate
// it when articles/pages change.
const getSitemapMinisite = (subdomain: string) =>
  unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('minisites')
        .select('id, name, full_domain, custom_domain, custom_domain_status, updated_at')
        .eq('subdomain', subdomain)
        .eq('status', 'active')
        .maybeSingle();
      if (error) {
        console.error('sitemap: error fetching minisite', error);
        return null;
      }
      return data || null;
    },
    ['sitemap-minisite', subdomain],
    {
      revalidate: SITEMAP_TTL_SECONDS,
      tags: [`minisite:subdomain:${subdomain}`],
    }
  )();

const getSitemapArticles = (minisiteId: string) =>
  unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('minisite_articles')
        .select('slug, updated_at, published_at')
        .eq('minisite_id', minisiteId)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) {
        console.error('sitemap: error fetching articles', error);
        return [];
      }
      return data || [];
    },
    ['sitemap-articles', minisiteId],
    {
      revalidate: SITEMAP_TTL_SECONDS,
      tags: [`minisite:${minisiteId}`, `minisite-articles:${minisiteId}`],
    }
  )();

const getSitemapPages = (minisiteId: string) =>
  unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('minisite_pages')
        .select('slug, updated_at')
        .eq('minisite_id', minisiteId);
      if (error) {
        console.error('sitemap: error fetching pages', error);
        return [];
      }
      return data || [];
    },
    ['sitemap-pages', minisiteId],
    {
      revalidate: SITEMAP_TTL_SECONDS,
      tags: [`minisite:${minisiteId}`, `minisite-pages:${minisiteId}`],
    }
  )();

export async function GET(request: NextRequest) {
  const subdomain = request.cookies.get('subdomain')?.value ||
    request.headers.get('x-subdomain');

  const isCustomDomain = request.cookies.get('is_custom_domain')?.value === 'true' ||
    request.headers.get('x-is-custom-domain') === 'true';

  if (!subdomain) {
    return new NextResponse('Sitemap not found', { status: 404 });
  }

  const minisite = await getSitemapMinisite(subdomain);

  if (!minisite) {
    return new NextResponse('Minisite not found', { status: 404 });
  }

  const hasActiveCustomDomain = minisite.custom_domain &&
    minisite.custom_domain_status === 'active';

  // Subdomain-only sites are noindexed; return an empty sitemap.
  if (!hasActiveCustomDomain && !isCustomDomain) {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap not available for temporary subdomains -->
</urlset>`;

    return new NextResponse(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }

  try {
    const siteUrl = minisite.custom_domain
      ? `https://${minisite.custom_domain}`
      : `https://${minisite.full_domain}`;

    const [articles, pages] = await Promise.all([
      getSitemapArticles(minisite.id),
      getSitemapPages(minisite.id),
    ]);

    const lastMod = new Date().toISOString().split('T')[0];
    let urls = '';

    urls += `
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    const staticPages = ['about', 'contact', 'blog'];
    for (const page of staticPages) {
      urls += `
  <url>
    <loc>${siteUrl}/${page}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    if (pages && pages.length > 0) {
      for (const page of pages) {
        if (!staticPages.includes(page.slug) && page.slug !== 'home') {
          const pageLastMod = page.updated_at
            ? new Date(page.updated_at).toISOString().split('T')[0]
            : lastMod;
          urls += `
  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${pageLastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }
      }
    }

    if (articles && articles.length > 0) {
      for (const article of articles) {
        const articleLastMod = article.updated_at
          ? new Date(article.updated_at).toISOString().split('T')[0]
          : article.published_at
          ? new Date(article.published_at).toISOString().split('T')[0]
          : lastMod;
        urls += `
  <url>
    <loc>${siteUrl}/blog/${article.slug}</loc>
    <lastmod>${articleLastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Generated sitemap for ${minisite.name} -->${urls}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
