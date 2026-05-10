/**
 * AI / editor pipelines sometimes embed multi‑MB data: URLs in page JSON or HTML.
 * Those strings explode Next.js responses twice: once in HTML, once in the client
 * bundle for `use client` parents (Navigation, ContentRenderer). Strip anything over
 * budget so every request stays small on the wire.
 */

import type { ContentBlock, Minisite, MinisiteArticle, MinisitePage } from './minisiteTypes';

export const MAX_PUBLIC_DATA_URL_CHARS = 64_000;

const SVG_TYPE = 'data:image/svg+xml';

function clipDataUrlString(s: string): string {
  if (!s.startsWith('data:')) return s;
  if (s.startsWith(SVG_TYPE) && s.length <= MAX_PUBLIC_DATA_URL_CHARS * 2) return s;
  if (s.length <= MAX_PUBLIC_DATA_URL_CHARS) return s;
  return '';
}

/** Depth-first clip of data: URLs on plain objects/arrays from JSON. */
export function deepClipDataUrls<T>(value: T): T {
  if (typeof value === 'string') return clipDataUrlString(value) as T;
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => deepClipDataUrls(v)) as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepClipDataUrls(v);
    }
    return out as T;
  }
  return value;
}

/** Remove oversized data: URLs inside img src attributes (HTML bodies). */
export function stripLargeDataImagesFromHtml(html: string): string {
  if (!html) return html;
  return html.replace(
    /src=(["'])data:image\/[^"']*\1/gi,
    (full) => (full.length > MAX_PUBLIC_DATA_URL_CHARS ? 'src=""' : full)
  );
}

function sanitizeBlockContentHtml(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    const data = deepClipDataUrls({ ...block.data }) as Record<string, unknown>;
    if (
      (block.type === 'text' || block.type === 'split') &&
      typeof data.content === 'string'
    ) {
      data.content = stripLargeDataImagesFromHtml(data.content);
    }
    return { ...block, data };
  });
}

export function sanitizeMinisite(m: Minisite | null): Minisite | null {
  if (!m) return null;
  return {
    ...m,
    logo_url: m.logo_url ? clipDataUrlString(m.logo_url) || null : m.logo_url,
    favicon_url: m.favicon_url ? clipDataUrlString(m.favicon_url) || null : m.favicon_url,
    description: m.description,
    theme_config: deepClipDataUrls(m.theme_config || {}),
  } as Minisite;
}

export function sanitizeMinisitePage(p: MinisitePage | null): MinisitePage | null {
  if (!p) return null;
  const content = Array.isArray(p.content)
    ? sanitizeBlockContentHtml(deepClipDataUrls(p.content) as ContentBlock[])
    : [];
  return { ...p, content };
}

export function sanitizeMinisiteArticles(list: MinisiteArticle[]): MinisiteArticle[] {
  return list.map((a) => ({
    ...a,
    excerpt: a.excerpt ? stripLargeDataImagesFromHtml(a.excerpt) : a.excerpt,
    link_excerpt: a.link_excerpt
      ? stripLargeDataImagesFromHtml(a.link_excerpt)
      : a.link_excerpt,
    featured_image: a.featured_image
      ? clipDataUrlString(a.featured_image) || null
      : a.featured_image,
  }));
}

export function sanitizeMinisiteArticle(a: MinisiteArticle | null): MinisiteArticle | null {
  if (!a) return null;
  return {
    ...a,
    excerpt: a.excerpt ? stripLargeDataImagesFromHtml(a.excerpt) : a.excerpt,
    link_excerpt: a.link_excerpt
      ? stripLargeDataImagesFromHtml(a.link_excerpt)
      : a.link_excerpt,
    featured_image: a.featured_image
      ? clipDataUrlString(a.featured_image) || null
      : a.featured_image,
    content: a.content ? stripLargeDataImagesFromHtml(a.content) : a.content,
  };
}
