import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// List of root domains where minisites are hosted
const ROOT_DOMAINS = [
  'autobloggingsites.io',
  'www.autobloggingsites.io',
  'yobstech.autobloggingsites.io',
  'minisite-nextjs.vercel.app',
  'localhost:3000',
  'localhost',
  // Add more domains as needed
];

// Create Supabase client for edge function
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache for custom domain lookups (to reduce DB queries)
const customDomainCache = new Map<string, { subdomain: string | null; expires: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Handle verification endpoint for custom domains
  if (url.pathname === '/.well-known/autoblog-verify') {
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'x-autoblog-verify': 'true',
        'Content-Type': 'text/plain',
      },
    });
  }
  
  // Check if this is a known root domain
  const isRootDomain = ROOT_DOMAINS.some(domain => hostname === domain);
  
  if (isRootDomain) {
    // This is the main domain, serve the landing page
    return NextResponse.next();
  }
  
  // Extract subdomain from hostname
  let subdomain: string | null = null;
  let isCustomDomain = false;
  
  // Handle localhost for development
  if (hostname.includes('localhost')) {
    // For local development, use query param for subdomain simulation
    subdomain = url.searchParams.get('subdomain');
  } else {
    // Check if this is a subdomain of our root domain
    const rootDomain = ROOT_DOMAINS.find(domain => 
      hostname.endsWith(`.${domain.replace('www.', '')}`)
    );
    
    if (rootDomain) {
      // Extract subdomain from real hostname
      // e.g., myblog.autobloggingsites.io -> myblog
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        subdomain = parts[0];
      }
    } else {
      // This might be a custom domain
      isCustomDomain = true;
      
      // Check cache first
      const cached = customDomainCache.get(hostname);
      if (cached && cached.expires > Date.now()) {
        subdomain = cached.subdomain;
      } else {
        // Look up the custom domain in the database
        try {
          const normalizedDomain = hostname.toLowerCase().replace(/^www\./, '');
          
          const { data } = await supabase
            .from('minisites')
            .select('subdomain')
            .eq('custom_domain', normalizedDomain)
            .eq('custom_domain_status', 'active')
            .eq('status', 'active')
            .single();
          
          if (data) {
            subdomain = data.subdomain;
          }
          
          // Cache the result (even if null, to avoid repeated lookups)
          customDomainCache.set(hostname, {
            subdomain: subdomain,
            expires: Date.now() + CACHE_TTL
          });
        } catch (error) {
          console.error('Error looking up custom domain:', error);
        }
      }
    }
  }
  
  // If we found a subdomain, rewrite to the dynamic route
  if (subdomain) {
    // Store subdomain in header for the page to access
    const response = NextResponse.rewrite(url);
    response.headers.set('x-subdomain', subdomain);
    response.headers.set('x-is-custom-domain', isCustomDomain ? 'true' : 'false');
    
    // Also set a cookie for client-side access
    response.cookies.set('subdomain', subdomain, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    if (isCustomDomain) {
      response.cookies.set('is_custom_domain', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
    
    return response;
  }
  
  // If this was supposed to be a custom domain but we couldn't find it,
  // return a helpful error page
  if (isCustomDomain) {
    // Return a 404 for unrecognized custom domains
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Domain Not Found</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.9; }
            a { color: white; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔍 Domain Not Found</h1>
            <p>This domain is not connected to any minisite.</p>
            <p>If you own this domain, please verify your DNS settings.</p>
            <p style="margin-top: 2rem; font-size: 0.9rem;">
              <a href="https://autobloggingsites.io">Create your own minisite →</a>
            </p>
          </div>
        </body>
      </html>
      `,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - api routes
     * - _next (Next.js internals)
     * - static files (images, etc.)
     * Note: robots.txt and sitemap.xml are handled by routes, so we DO match them
     */
    '/((?!api|_next|favicon.ico).*)',
  ],
};
