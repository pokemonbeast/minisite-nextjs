import Link from 'next/link';
import { Minisite } from '@/lib/supabase';

interface FooterProps {
  minisite: Minisite;
}

export function Footer({ minisite }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const themeConfig = minisite.theme_config || {};
  const footerLayout = themeConfig.footerLayout || 'standard';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  switch (footerLayout) {
    case 'centered':
      return <CenteredFooter minisite={minisite} navLinks={navLinks} legalLinks={legalLinks} year={currentYear} />;
    case 'minimal':
      return <MinimalFooter minisite={minisite} navLinks={navLinks} legalLinks={legalLinks} year={currentYear} />;
    case 'split':
      return <SplitFooter minisite={minisite} navLinks={navLinks} legalLinks={legalLinks} year={currentYear} />;
    case 'stacked':
      return <StackedFooter minisite={minisite} navLinks={navLinks} legalLinks={legalLinks} year={currentYear} />;
    default:
      return <StandardFooter minisite={minisite} navLinks={navLinks} legalLinks={legalLinks} year={currentYear} />;
  }
}

interface FooterLayoutProps {
  minisite: Minisite;
  navLinks: { href: string; label: string }[];
  legalLinks: { href: string; label: string }[];
  year: number;
}

// Standard Footer: Multi-column layout
function StandardFooter({ minisite, navLinks, legalLinks, year }: FooterLayoutProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {minisite.name}
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              {minisite.description.slice(0, 150)}
              {minisite.description.length > 150 ? '...' : ''}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: minisite.primary_color }}
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {year} {minisite.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Centered Footer: Logo and links centered
function CenteredFooter({ minisite, navLinks, legalLinks, year }: FooterLayoutProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h3 
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
          >
            {minisite.name}
          </h3>
          
          <nav className="flex flex-wrap justify-center gap-8 mb-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center gap-6 mb-8">
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-full text-white font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: minisite.accent_color }}
            >
              Get in Touch
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500">
              <p>© {year} {minisite.name}</p>
              <span className="hidden sm:inline">•</span>
              <div className="flex gap-4">
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-gray-700 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Minimal Footer: Simple single line
function MinimalFooter({ minisite, navLinks, legalLinks, year }: FooterLayoutProps) {
  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span 
              className="font-bold text-lg"
              style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
            >
              {minisite.name}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">© {year}</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-gray-200">•</span>
            {legalLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

// Split Footer: Left and right columns
function SplitFooter({ minisite, navLinks, legalLinks, year }: FooterLayoutProps) {
  return (
    <footer 
      className="text-white"
      style={{ backgroundColor: minisite.primary_color }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {minisite.name}
            </h3>
            <p className="text-white/80 max-w-md mb-6">
              {minisite.description.slice(0, 200)}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-medium transition-transform hover:scale-105"
              style={{ color: minisite.primary_color }}
            >
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-white/90">Navigation</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white/90">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
          © {year} {minisite.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Stacked Footer: Multi-section vertical layout
function StackedFooter({ minisite, navLinks, legalLinks, year }: FooterLayoutProps) {
  return (
    <footer className="bg-gray-50">
      {/* CTA Section */}
      <div 
        className="py-12"
        style={{ backgroundColor: minisite.secondary_color }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 
            className="text-2xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Get Started?
          </h3>
          <p className="text-white/80 mb-6">Get in touch with us today.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-full font-medium transition-transform hover:scale-105"
            style={{ color: minisite.secondary_color }}
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Links Section */}
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h4 
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: minisite.primary_color }}
              >
                {minisite.name}
              </h4>
              <p className="text-gray-500 text-sm max-w-md">
                {minisite.description.slice(0, 100)}
              </p>
            </div>
            <nav className="flex flex-wrap gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {year} {minisite.name}. All rights reserved.</p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gray-700 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
