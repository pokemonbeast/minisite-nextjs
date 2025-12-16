import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Root domains where minisites are hosted
const ROOT_DOMAINS = [
  'autobloggingsites.io',
  'minisite-nextjs.vercel.app',
];

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if this is a subdomain of our platform (*.autobloggingsites.io)
  const isTemporarySubdomain = ROOT_DOMAINS.some(domain => 
    hostname.endsWith(`.${domain}`)
  );
  
  // For temporary subdomains, return empty sitemap since they're noindexed
  if (isTemporarySubdomain) {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap not available for temporary subdomains -->
</urlset>`;
    
    return new NextResponse(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  
  // For custom domains, look up by the domain itself
  // Get subdomain from cookie/header (set by middleware) or try to find by custom domain
  let subdomain = request.cookies.get('subdomain')?.value ||
    request.headers.get('x-subdomain');
  
  // If no subdomain but we have a hostname, try to find minisite by custom_domain
  if (!subdomain && hostname) {
    const { data: minisiteByDomain } = await supabase
      .from('minisites')
      .select('subdomain')
      .eq('custom_domain', hostname.replace('www.', ''))
      .eq('status', 'active')
      .single();
    
    if (minisiteByDomain) {
      subdomain = minisiteByDomain.subdomain;
    }
  }
  
  if (!subdomain) {
    return new NextResponse('Sitemap not found', { status: 404 });
  }
  
  try {
    // Fetch minisite data
    const { data: minisite, error: minisiteError } = await supabase
      .from('minisites')
      .select('id, name, full_domain, custom_domain, updated_at')
      .eq('subdomain', subdomain)
      .eq('status', 'active')
      .single();
    
    if (minisiteError || !minisite) {
      return new NextResponse('Minisite not found', { status: 404 });
    }
    
    // Use custom domain if available, otherwise full_domain
    const siteUrl = minisite.custom_domain 
      ? `https://${minisite.custom_domain}`
      : `https://${minisite.full_domain}`;
    
    // Fetch all published articles
    const { data: articles, error: articlesError } = await supabase
      .from('minisite_articles')
      .select('slug, updated_at, published_at')
      .eq('minisite_id', minisite.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    }
    
    // Fetch all pages
    const { data: pages, error: pagesError } = await supabase
      .from('minisite_pages')
      .select('slug, updated_at')
      .eq('minisite_id', minisite.id);
    
    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
    }
    
    // Build sitemap XML
    const lastMod = new Date().toISOString().split('T')[0];
    
    let urls = '';
    
    // Homepage
    urls += `
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;
    
    // Static pages
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
    
    // Dynamic pages from database
    if (pages && pages.length > 0) {
      for (const page of pages) {
        // Skip if it's a standard page we already added
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
    
    // Blog articles
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
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

