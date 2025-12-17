import './globals.css';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { getMinisiteBySubdomain } from '@/lib/supabase';
import { generateThemeVariables, getGoogleFontsUrl } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Minisite',
  description: 'A dynamic minisite',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get subdomain from headers or cookies
  const headersList = headers();
  const cookieStore = cookies();
  
  const subdomain = headersList.get('x-subdomain') || cookieStore.get('subdomain')?.value || null;
  const isCustomDomain = headersList.get('x-is-custom-domain') === 'true' || 
    cookieStore.get('is_custom_domain')?.value === 'true';
  
  let minisite = null;
  let themeVariables = '';
  let fontsUrl = '';
  
  if (subdomain) {
    minisite = await getMinisiteBySubdomain(subdomain);
    if (minisite) {
      themeVariables = generateThemeVariables(minisite);
      fontsUrl = getGoogleFontsUrl(minisite);
    }
  }

  // Block indexing for *.autobloggingsites.io subdomains (not custom domains)
  const shouldBlockIndexing = subdomain && !isCustomDomain;

  return (
    <html lang="en">
      <head>
        {/* Block indexing for temporary subdomains */}
        {shouldBlockIndexing && (
          <>
            <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
            <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
            <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
          </>
        )}
        {/* Favicon - use favicon_url, fallback to logo_url */}
        {(minisite?.favicon_url || minisite?.logo_url) && (
          <link rel="icon" href={minisite.favicon_url || minisite.logo_url || ''} />
        )}
        {fontsUrl && <link href={fontsUrl} rel="stylesheet" />}
        {themeVariables && (
          <style dangerouslySetInnerHTML={{ __html: themeVariables }} />
        )}
      </head>
      <body 
        className="min-h-screen bg-white antialiased"
        style={{ 
          fontFamily: minisite ? `var(--font-body)` : 'system-ui, sans-serif' 
        }}
      >
        {children}
      </body>
    </html>
  );
}


