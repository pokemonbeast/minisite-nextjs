/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // User media already lives on CDNs (Cloudflare Images, etc.). Routing every
    // byte through Vercel's /_next/image optimizer was driving ~TB-scale
    // "CDN → Compute" and egress; the browser loads optimized URLs directly instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Allow any subdomain
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

