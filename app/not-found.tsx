import { permanentRedirect } from 'next/navigation';

/**
 * Global 404 handler - permanently redirects all not-found pages to the homepage
 * This ensures users never see a 404 error on PBN minisites and are
 * instead redirected to the site's homepage for better SEO and UX.
 * 
 * Uses 308 permanent redirect to tell search engines to consolidate
 * link equity to the homepage and stop crawling invalid URLs.
 */
export default function NotFound() {
  // Server-side permanent redirect to homepage (308 status code)
  permanentRedirect('/');
}

