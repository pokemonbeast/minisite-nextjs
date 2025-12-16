import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for minisite data
export interface Minisite {
  id: string;
  name: string;
  subdomain: string;
  full_domain: string;
  custom_domain: string | null;
  custom_domain_status: 'pending' | 'verifying' | 'active' | 'failed' | null;
  description: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  theme_config: ThemeConfig;
  status: 'creating' | 'active' | 'paused' | 'error';
}

export interface ThemeConfig {
  heroStyle?: 'centered' | 'split' | 'fullwidth' | 'minimal';
  blogLayout?: 'grid' | 'list' | 'masonry';
  blogStyle?: 'cards' | 'minimal' | 'magazine' | 'compact';
  blogLabel?: 'Blog' | 'Articles';
  navStyle?: 'transparent' | 'solid' | 'floating';
  navLayout?: 'standard' | 'centered' | 'minimal' | 'split' | 'stacked';
  logoDisplay?: 'withText' | 'iconOnly';
  footerLayout?: 'standard' | 'centered' | 'minimal' | 'split' | 'stacked';
  contactLayout?: 'standard' | 'split' | 'minimal' | 'card';
  mood?: string;
  typography?: {
    scale?: 'compact' | 'default' | 'large' | 'dramatic';
    headingWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    bodySize?: 'sm' | 'base' | 'lg';
    letterSpacing?: 'tight' | 'normal' | 'wide';
    lineHeight?: 'snug' | 'normal' | 'relaxed';
  };
  contentSections?: {
    includeExcerptLinks?: boolean;
  };
  images?: {
    hero?: string;
    about?: string;
    feature1?: string;
    feature2?: string;
    feature3?: string;
  };
}

export interface MinisitePage {
  id: string;
  minisite_id: string;
  slug: string;
  title: string;
  content: ContentBlock[];
  seo_title: string | null;
  seo_description: string | null;
}

export interface ContentBlock {
  type: 'hero' | 'text' | 'image' | 'cta' | 'features' | 'blogroll' | 'contact' | 
        'testimonials' | 'stats' | 'team' | 'faq' | 'timeline' | 
        'pricing' | 'split' | 'banner' | 'logos';
  data: Record<string, any>;
}

export interface MinisiteArticle {
  id: string;
  minisite_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  link_excerpt: string | null;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

// Fetch minisite by subdomain
export async function getMinisiteBySubdomain(subdomain: string): Promise<Minisite | null> {
  const { data, error } = await supabase
    .from('minisites')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    console.error('Error fetching minisite:', error);
    return null;
  }

  return data;
}

// Fetch minisite by custom domain
export async function getMinisiteByCustomDomain(customDomain: string): Promise<Minisite | null> {
  // Normalize the domain (remove www. prefix if present)
  const normalizedDomain = customDomain.toLowerCase().replace(/^www\./, '');
  
  const { data, error } = await supabase
    .from('minisites')
    .select('*')
    .eq('custom_domain', normalizedDomain)
    .eq('custom_domain_status', 'active')
    .eq('status', 'active')
    .single();

  if (error || !data) {
    // Also try with www. prefix in case it was stored that way
    const { data: dataWithWww, error: errorWithWww } = await supabase
      .from('minisites')
      .select('*')
      .eq('custom_domain', `www.${normalizedDomain}`)
      .eq('custom_domain_status', 'active')
      .eq('status', 'active')
      .single();
      
    if (errorWithWww || !dataWithWww) {
      console.error('Error fetching minisite by custom domain:', error);
      return null;
    }
    
    return dataWithWww;
  }

  return data;
}

// Fetch minisite by hostname (tries subdomain first, then custom domain)
export async function getMinisiteByHostname(hostname: string): Promise<{ minisite: Minisite | null; isCustomDomain: boolean }> {
  // List of root domains where minisites are hosted
  const ROOT_DOMAINS = [
    'autobloggingsites.io',
    'yobstech.autobloggingsites.io',
    'minisite-nextjs.vercel.app',
    'localhost',
  ];
  
  // Check if this is one of our root domains
  const isRootDomain = ROOT_DOMAINS.some(domain => 
    hostname === domain || hostname === `www.${domain}`
  );
  
  if (isRootDomain) {
    return { minisite: null, isCustomDomain: false };
  }
  
  // Check if this is a subdomain of our root domain
  for (const rootDomain of ROOT_DOMAINS) {
    if (hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.replace(`.${rootDomain}`, '');
      if (subdomain && !subdomain.includes('.')) {
        const minisite = await getMinisiteBySubdomain(subdomain);
        return { minisite, isCustomDomain: false };
      }
    }
  }
  
  // This must be a custom domain
  const minisite = await getMinisiteByCustomDomain(hostname);
  return { minisite, isCustomDomain: true };
}

// Fetch minisite pages
export async function getMinisitePages(minisiteId: string): Promise<MinisitePage[]> {
  const { data, error } = await supabase
    .from('minisite_pages')
    .select('*')
    .eq('minisite_id', minisiteId)
    .order('slug');

  if (error) {
    console.error('Error fetching pages:', error);
    return [];
  }

  return data || [];
}

// Fetch single page
export async function getMinisitePage(minisiteId: string, slug: string): Promise<MinisitePage | null> {
  const { data, error } = await supabase
    .from('minisite_pages')
    .select('*')
    .eq('minisite_id', minisiteId)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching page:', error);
    return null;
  }

  return data;
}

// Fetch published articles
export async function getMinisiteArticles(minisiteId: string, limit?: number): Promise<MinisiteArticle[]> {
  let query = supabase
    .from('minisite_articles')
    .select('*')
    .eq('minisite_id', minisiteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

// Fetch single article
export async function getMinisiteArticle(minisiteId: string, slug: string): Promise<MinisiteArticle | null> {
  const { data, error } = await supabase
    .from('minisite_articles')
    .select('*')
    .eq('minisite_id', minisiteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

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

