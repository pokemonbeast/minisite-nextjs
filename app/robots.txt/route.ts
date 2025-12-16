import { NextRequest, NextResponse } from 'next/server';

// Root domains where minisites are hosted (subdomains should be blocked)
const ROOT_DOMAINS = [
  'autobloggingsites.io',
  'minisite-nextjs.vercel.app',
];

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if this is a subdomain of our root domains (should be blocked)
  const isSubdomain = ROOT_DOMAINS.some(domain => 
    hostname.endsWith(`.${domain}`) && hostname !== domain && hostname !== `www.${domain}`
  );
  
  // Check for custom domain cookie/header (set by middleware)
  const isCustomDomain = request.cookies.get('is_custom_domain')?.value === 'true' ||
    request.headers.get('x-is-custom-domain') === 'true';
  
  let robotsContent: string;
  
  if (isSubdomain && !isCustomDomain) {
    // Block all robots for *.autobloggingsites.io subdomains
    robotsContent = `# Robots.txt for temporary subdomain
# This subdomain is a staging/preview environment
# Please index the custom domain instead

User-agent: *
Disallow: /

# Block all known crawlers explicitly
User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /

User-agent: Slurp
Disallow: /

User-agent: DuckDuckBot
Disallow: /

User-agent: Baiduspider
Disallow: /

User-agent: YandexBot
Disallow: /

User-agent: facebookexternalhit
Disallow: /

User-agent: Twitterbot
Disallow: /

User-agent: LinkedInBot
Disallow: /
`;
  } else {
    // Custom domains: Allow search engines, block SEO crawlers
    robotsContent = `# Robots.txt for ${hostname}

# Allow major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# Allow social media crawlers for previews
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Block SEO tool crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: MegaIndex
Disallow: /

User-agent: SeznamBot
Disallow: /

User-agent: SEOkicks
Disallow: /

User-agent: SEOkicks-Robot
Disallow: /

User-agent: sistrix
Disallow: /

User-agent: JETKEYLOG
Disallow: /

User-agent: Screaming Frog SEO Spider
Disallow: /

User-agent: Moz
Disallow: /

User-agent: rogerbot
Disallow: /

User-agent: Majestic
Disallow: /

User-agent: MajesticBot
Disallow: /

User-agent: BacklinkCrawler
Disallow: /

User-agent: OpenLinkProfiler
Disallow: /

User-agent: Serpstat
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: BomboraBot
Disallow: /

User-agent: ZoominfoBot
Disallow: /

# Default: allow others
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://${hostname}/sitemap.xml
`;
  }
  
  return new NextResponse(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

