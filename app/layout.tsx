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

  return (
    <html lang="en">
      <head>
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


