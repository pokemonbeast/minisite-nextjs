# Minisite Next.js App

Multi-tenant minisite platform built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Multi-tenant Architecture**: Serve multiple minisites from a single deployment using subdomain routing
- **Dynamic Theming**: Each minisite has its own colors, fonts, and layout preferences
- **Blog System**: Full-featured blog with SEO optimization
- **Contact Forms**: Integrated contact form submissions
- **Responsive Design**: Mobile-first, responsive layouts
- **AI-Generated Content**: Sites are created with AI-generated branding and images

## Setup

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Installation

```bash
npm install
npm run dev
```

### Local Development

For local development, you can simulate subdomains using query parameters:

```
http://localhost:3000?subdomain=your-subdomain
```

Or use a tool like `localhost.run` to test with actual subdomains.

## Deployment to Vercel

1. Push this directory to a new GitHub repo
2. Import to Vercel
3. Add environment variables
4. Configure wildcard domain (*.minisites.yourdomain.com)

### Vercel Configuration

In your Vercel project settings:

1. Add your wildcard domain: `*.minisites.yourdomain.com`
2. The middleware will automatically route requests to the correct minisite

## Architecture

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── blog/              # Blog pages
│       ├── page.tsx       # Blog listing
│       └── [slug]/        # Individual articles
├── components/            # React components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── ContentRenderer.tsx
│   └── ContactForm.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client & queries
│   └── theme.ts          # Theme utilities
└── middleware.ts          # Subdomain routing
```

## Theme Configuration

Each minisite supports:

- **Colors**: Primary, Secondary, Accent
- **Fonts**: Heading and Body (Google Fonts)
- **Layouts**: Hero style, Blog layout, Navigation style

CSS variables are dynamically injected based on the minisite's configuration.

## Content Blocks

The page content system supports these block types:

- `hero` - Hero section with title, subtitle, CTA
- `text` - Rich text content
- `image` - Single image with caption
- `cta` - Call-to-action section
- `features` - Feature grid with images
- `blogroll` - Recent articles listing
- `contact` - Contact form

## Cloudflare Integration

All minisites are proxied through Cloudflare for:

- SSL/TLS termination
- CDN caching
- DDoS protection
- Hidden origin IP (for PBN footprint avoidance)


