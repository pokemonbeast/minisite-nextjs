import { Minisite, ThemeConfig } from './supabase';

// Convert hex to RGB for CSS variables
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0 0';
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

// Generate CSS variables from minisite config
export function generateThemeVariables(minisite: Minisite): string {
  return `
    :root {
      --color-primary: ${hexToRgb(minisite.primary_color)};
      --color-secondary: ${hexToRgb(minisite.secondary_color)};
      --color-accent: ${hexToRgb(minisite.accent_color)};
      --font-heading: '${minisite.font_heading}', sans-serif;
      --font-body: '${minisite.font_body}', sans-serif;
    }
  `;
}

// Get hero style classes based on theme config
export function getHeroClasses(themeConfig: ThemeConfig): string {
  const baseClasses = 'relative overflow-hidden';
  
  switch (themeConfig.heroStyle) {
    case 'split':
      return `${baseClasses} min-h-[70vh] grid md:grid-cols-2`;
    case 'fullwidth':
      return `${baseClasses} min-h-screen flex items-center`;
    case 'minimal':
      return `${baseClasses} py-20`;
    case 'centered':
    default:
      return `${baseClasses} min-h-[60vh] flex items-center justify-center text-center`;
  }
}

// Get blog layout classes
export function getBlogLayoutClasses(themeConfig: ThemeConfig): string {
  switch (themeConfig.blogLayout) {
    case 'list':
      return 'space-y-6';
    case 'masonry':
      return 'columns-1 md:columns-2 lg:columns-3 gap-6';
    case 'grid':
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }
}

// Get navigation style classes
export function getNavClasses(themeConfig: ThemeConfig, isScrolled: boolean): string {
  const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
  
  switch (themeConfig.navStyle) {
    case 'transparent':
      return `${baseClasses} ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
    case 'floating':
      return `${baseClasses} m-4 rounded-full ${isScrolled ? 'bg-white/95 shadow-lg' : 'bg-white/80 backdrop-blur'}`;
    case 'solid':
    default:
      return `${baseClasses} bg-white shadow-sm`;
  }
}

// Generate Google Fonts URL
export function getGoogleFontsUrl(minisite: Minisite): string {
  const fonts = new Set([minisite.font_heading, minisite.font_body]);
  const fontParams = Array.from(fonts)
    .map(font => `family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

// Generate meta tags for SEO
export function generateMetaTags(minisite: Minisite, page?: { seo_title?: string | null; seo_description?: string | null }) {
  return {
    title: page?.seo_title || minisite.name,
    description: page?.seo_description || minisite.description,
    openGraph: {
      title: page?.seo_title || minisite.name,
      description: page?.seo_description || minisite.description,
      siteName: minisite.name,
      type: 'website',
    },
  };
}

// Color utilities for components
export function getPrimaryStyles(minisite: Minisite) {
  return {
    backgroundColor: minisite.primary_color,
    color: getContrastColor(minisite.primary_color),
  };
}

export function getSecondaryStyles(minisite: Minisite) {
  return {
    backgroundColor: minisite.secondary_color,
    color: getContrastColor(minisite.secondary_color),
  };
}

export function getAccentStyles(minisite: Minisite) {
  return {
    backgroundColor: minisite.accent_color,
    color: getContrastColor(minisite.accent_color),
  };
}

// Get contrasting text color (black or white) based on background
function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor).split(' ').map(Number);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Lighten a hex color
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex).split(' ').map(Number);
  const lighter = rgb.map(c => Math.min(255, Math.floor(c + (255 - c) * (percent / 100))));
  return `rgb(${lighter.join(', ')})`;
}

// Darken a hex color
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex).split(' ').map(Number);
  const darker = rgb.map(c => Math.max(0, Math.floor(c * (1 - percent / 100))));
  return `rgb(${darker.join(', ')})`;
}

