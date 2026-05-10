import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import {
  sanitizeMinisite,
  sanitizeMinisiteArticle,
  sanitizeMinisiteArticles,
  sanitizeMinisitePage,
} from './sanitizePublicPayload';
import type { Minisite, MinisiteArticle, MinisitePage } from './minisiteTypes';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type {
  ContentBlock,
  Minisite,
  MinisiteArticle,
  MinisitePage,
  ThemeConfig,
} from './minisiteTypes';

// Columns we actually consume on the public site. Avoids returning large
// internal columns (user_id, cloudflare_record_id, error_message, audit
// timestamps, …) on every request.
const MINISITE_PUBLIC_COLUMNS =
  'id, name, subdomain, full_domain, custom_domain, custom_domain_status, description, logo_url, favicon_url, primary_color, secondary_color, accent_color, font_heading, font_body, theme_config, status';

// Page list views need the full content blocks but not internal flags.
const MINISITE_PAGE_COLUMNS =
  'id, minisite_id, slug, title, content, seo_title, seo_description';

// Article list view: never returns the full HTML body. Returning full
// article bodies on every homepage/blog index page view was the single
// biggest driver of PostgREST egress on this project.
const MINISITE_ARTICLE_LIST_COLUMNS =
  'id, minisite_id, title, slug, excerpt, link_excerpt, featured_image, status, published_at, seo_title, seo_description';

// Single-article view: same fields as list plus HTML body; avoid select('*') PBN/metadata columns.
const MINISITE_ARTICLE_DETAIL_COLUMNS = `${MINISITE_ARTICLE_LIST_COLUMNS}, content`;

// All public data on minisites is safe to cache because it's the same for
// every visitor. We use Next.js' unstable_cache so a single Supabase read
// per (minisite, slug) is amortised across every request that lands on a
// Vercel instance during the TTL, and is invalidated by tag from the
// dashboard whenever the user changes content.
//
// Tag conventions (kept in one place so the dashboard can target them):
//   minisite:subdomain:<subdomain>
//   minisite:domain:<custom_domain>
//   minisite:<id>
//   minisite-pages:<minisiteId>
//   minisite-page:<minisiteId>:<slug>
//   minisite-articles:<minisiteId>
//   minisite-article:<minisiteId>:<slug>
const CACHE_TTL_SECONDS = 3600; // 1 hour; revalidateTag still invalidates on edits

// --- helpers ---------------------------------------------------------------

const fetchMinisiteBySubdomain = async (subdomain: string): Promise<Minisite | null> => {
  const { data, error } = await supabase
    .from('minisites')
    .select(MINISITE_PUBLIC_COLUMNS)
    .eq('subdomain', subdomain)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching minisite by subdomain:', error);
    return null;
  }
  return sanitizeMinisite((data as unknown as Minisite) || null);
};

const fetchMinisiteByCustomDomain = async (customDomain: string): Promise<Minisite | null> => {
  const normalizedDomain = customDomain.toLowerCase().replace(/^www\./, '');

  const { data, error } = await supabase
    .from('minisites')
    .select(MINISITE_PUBLIC_COLUMNS)
    .or(`custom_domain.eq.${normalizedDomain},custom_domain.eq.www.${normalizedDomain}`)
    .eq('custom_domain_status', 'active')
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching minisite by custom domain:', error);
    return null;
  }

  return sanitizeMinisite((data as unknown as Minisite) || null);
};

const fetchMinisitePages = async (minisiteId: string): Promise<MinisitePage[]> => {
  const { data, error } = await supabase
    .from('minisite_pages')
    .select(MINISITE_PAGE_COLUMNS)
    .eq('minisite_id', minisiteId)
    .order('slug');

  if (error) {
    console.error('Error fetching pages:', error);
    return [];
  }

  const rows = (data as unknown as MinisitePage[]) || [];
  return rows.map((p) => sanitizeMinisitePage(p)!).filter(Boolean);
};

const fetchMinisitePage = async (minisiteId: string, slug: string): Promise<MinisitePage | null> => {
  const { data, error } = await supabase
    .from('minisite_pages')
    .select(MINISITE_PAGE_COLUMNS)
    .eq('minisite_id', minisiteId)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching page:', error);
    return null;
  }

  return sanitizeMinisitePage((data as unknown as MinisitePage) || null);
};

const fetchMinisiteArticles = async (minisiteId: string, limit: number): Promise<MinisiteArticle[]> => {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const { data, error } = await supabase
    .from('minisite_articles')
    .select(MINISITE_ARTICLE_LIST_COLUMNS)
    .eq('minisite_id', minisiteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return sanitizeMinisiteArticles((data as unknown as MinisiteArticle[]) || []);
};

const fetchMinisiteArticle = async (minisiteId: string, slug: string): Promise<MinisiteArticle | null> => {
  const { data, error } = await supabase
    .from('minisite_articles')
    .select(MINISITE_ARTICLE_DETAIL_COLUMNS)
    .eq('minisite_id', minisiteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return sanitizeMinisiteArticle((data as MinisiteArticle) || null);
};

// --- public, cached API ----------------------------------------------------
// React cache() dedupes identical reads within one request (e.g. generateMetadata + page).

async function loadMinisiteBySubdomain(subdomain: string): Promise<Minisite | null> {
  return unstable_cache(
    () => fetchMinisiteBySubdomain(subdomain),
    ['minisite-by-subdomain', subdomain],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [`minisite:subdomain:${subdomain}`],
    }
  )();
}

export const getMinisiteBySubdomain = cache(loadMinisiteBySubdomain);

async function loadMinisiteByCustomDomain(customDomain: string): Promise<Minisite | null> {
  const normalized = customDomain.toLowerCase().replace(/^www\./, '');
  return unstable_cache(
    () => fetchMinisiteByCustomDomain(customDomain),
    ['minisite-by-custom-domain', normalized],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [`minisite:domain:${normalized}`],
    }
  )();
}

export const getMinisiteByCustomDomain = cache(loadMinisiteByCustomDomain);

// Fetch minisite by hostname (tries subdomain first, then custom domain)
async function loadMinisiteByHostname(hostname: string): Promise<{ minisite: Minisite | null; isCustomDomain: boolean }> {
  const ROOT_DOMAINS = [
    'autobloggingsites.io',
    'yobstech.autobloggingsites.io',
    'minisite-nextjs.vercel.app',
    'localhost',
  ];

  const isRootDomain = ROOT_DOMAINS.some(domain =>
    hostname === domain || hostname === `www.${domain}`
  );

  if (isRootDomain) {
    return { minisite: null, isCustomDomain: false };
  }

  for (const rootDomain of ROOT_DOMAINS) {
    if (hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.replace(`.${rootDomain}`, '');
      if (subdomain && !subdomain.includes('.')) {
        const minisite = await getMinisiteBySubdomain(subdomain);
        return { minisite, isCustomDomain: false };
      }
    }
  }

  const minisite = await getMinisiteByCustomDomain(hostname);
  return { minisite, isCustomDomain: true };
}

export const getMinisiteByHostname = cache(loadMinisiteByHostname);

async function loadMinisitePages(minisiteId: string): Promise<MinisitePage[]> {
  return unstable_cache(
    () => fetchMinisitePages(minisiteId),
    ['minisite-pages', minisiteId],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [`minisite:${minisiteId}`, `minisite-pages:${minisiteId}`],
    }
  )();
}

export const getMinisitePages = cache(loadMinisitePages);

async function loadMinisitePage(minisiteId: string, slug: string): Promise<MinisitePage | null> {
  return unstable_cache(
    () => fetchMinisitePage(minisiteId, slug),
    ['minisite-page', minisiteId, slug],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [
        `minisite:${minisiteId}`,
        `minisite-page:${minisiteId}:${slug}`,
      ],
    }
  )();
}

export const getMinisitePage = cache(loadMinisitePage);

async function loadMinisiteArticles(minisiteId: string, limit: number = 50): Promise<MinisiteArticle[]> {
  return unstable_cache(
    () => fetchMinisiteArticles(minisiteId, limit),
    ['minisite-articles', minisiteId, String(limit)],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [`minisite:${minisiteId}`, `minisite-articles:${minisiteId}`],
    }
  )();
}

export const getMinisiteArticles = cache(loadMinisiteArticles);

async function loadMinisiteArticle(minisiteId: string, slug: string): Promise<MinisiteArticle | null> {
  return unstable_cache(
    () => fetchMinisiteArticle(minisiteId, slug),
    ['minisite-article', minisiteId, slug],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: [
        `minisite:${minisiteId}`,
        `minisite-article:${minisiteId}:${slug}`,
      ],
    }
  )();
}

export const getMinisiteArticle = cache(loadMinisiteArticle);

// Submit contact form to cta_submissions table
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  minisite_id: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('cta_submissions')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      minisite_id: data.minisite_id,
      cta_type: 'contact_form'
    });

  if (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }

  return true;
}
