export interface Minisite {
  id: string;
  name: string;
  subdomain: string;
  full_domain: string;
  custom_domain: string | null;
  custom_domain_status: 'pending' | 'verifying' | 'active' | 'failed' | null;
  description: string;
  logo_url: string | null;
  favicon_url: string | null;
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
  homepageArticlesCount?: number;
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
