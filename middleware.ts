import { NextRequest, NextResponse } from 'next/server';

// List of root domains where minisites are hosted
const ROOT_DOMAINS = [
  'minisites.yourdomain.com',
  'localhost:3000',
  // Add more domains as needed
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Check if this is a known root domain
  const isRootDomain = ROOT_DOMAINS.some(domain => hostname === domain);
  
  if (isRootDomain) {
    // This is the main domain, serve the landing page
    return NextResponse.next();
  }
  
  // Extract subdomain from hostname
  let subdomain: string | null = null;
  
  // Handle localhost for development
  if (hostname.includes('localhost')) {
    // For local development, use query param for subdomain simulation
    subdomain = url.searchParams.get('subdomain');
  } else {
    // Extract subdomain from real hostname
    // e.g., myblog.minisites.yourdomain.com -> myblog
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }
  
  // If we found a subdomain, rewrite to the dynamic route
  if (subdomain) {
    // Store subdomain in header for the page to access
    const response = NextResponse.rewrite(url);
    response.headers.set('x-subdomain', subdomain);
    
    // Also set a cookie for client-side access
    response.cookies.set('subdomain', subdomain, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return response;
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
     */
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

