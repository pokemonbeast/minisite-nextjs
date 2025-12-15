'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minisite } from '@/lib/supabase';

// Logo component with error handling
function LogoImage({ 
  src, 
  alt, 
  fallbackInitial,
  primaryColor,
  size = 56
}: { 
  src: string; 
  alt: string; 
  fallbackInitial: string;
  primaryColor: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="rounded-lg flex items-center justify-center text-white font-bold"
        style={{ 
          backgroundColor: primaryColor, 
          width: size, 
          height: size,
          fontSize: size * 0.4
        }}
      >
        {fallbackInitial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-lg object-contain"
      onError={() => setHasError(true)}
    />
  );
}

interface NavigationProps {
  minisite: Minisite;
}

export function Navigation({ minisite }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const themeConfig = minisite.theme_config || {};
  const navStyle = themeConfig.navStyle || 'solid';
  const navLayout = themeConfig.navLayout || 'standard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  // Dynamic classes based on style
  const getNavContainerClasses = () => {
    const base = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
    
    switch (navStyle) {
      case 'transparent':
        return `${base} ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
      case 'floating':
        return `${base} ${isScrolled ? '' : 'py-3'}`;
      default:
        return `${base} bg-white shadow-sm`;
    }
  };

  const getInnerNavClasses = () => {
    if (navStyle === 'floating') {
      return `mx-4 rounded-2xl transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/98 shadow-lg backdrop-blur-sm' 
          : 'bg-white/90 backdrop-blur shadow-md'
      }`;
    }
    return '';
  };

  const textColor = navStyle === 'transparent' && !isScrolled ? 'text-white' : 'text-gray-700';
  const hoverColor = navStyle === 'transparent' && !isScrolled 
    ? 'hover:text-white/80' 
    : 'hover:text-gray-900';

  // Render different navigation layouts
  const renderNavContent = () => {
    switch (navLayout) {
      case 'centered':
        return <CenteredNav {...{ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }} />;
      case 'minimal':
        return <MinimalNav {...{ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }} />;
      case 'split':
        return <SplitNav {...{ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }} />;
      case 'stacked':
        return <StackedNav {...{ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen, isScrolled }} />;
      default:
        return <StandardNav {...{ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }} />;
    }
  };

  return (
    <nav className={getNavContainerClasses()}>
      <div className={getInnerNavClasses()}>
        {renderNavContent()}
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// Standard Navigation: Logo left, links right
function StandardNav({ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-18 py-3">
        <Link href="/" className="flex items-center gap-3">
          {minisite.logo_url ? (
            <LogoImage
              src={minisite.logo_url}
              alt={minisite.name}
              fallbackInitial={minisite.name.charAt(0)}
              primaryColor={minisite.primary_color}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: minisite.primary_color }}
            >
              {minisite.name.charAt(0)}
            </div>
          )}
          <span 
            className={`font-semibold text-xl ${textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {minisite.name}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColor} ${hoverColor} transition-colors font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <MobileMenuButton textColor={textColor} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
    </div>
  );
}

// Centered Navigation: Logo centered with nav links on sides
function CenteredNav({ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const leftLinks = navLinks.slice(0, 2);
  const rightLinks = navLinks.slice(2);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20 py-3">
        {/* Left links */}
        <div className="hidden md:flex items-center gap-8 flex-1">
          {leftLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColor} ${hoverColor} transition-colors font-medium tracking-wide uppercase text-sm`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link href="/" className="flex flex-col items-center gap-1">
          {minisite.logo_url ? (
            <LogoImage
              src={minisite.logo_url}
              alt={minisite.name}
              fallbackInitial={minisite.name.charAt(0)}
              primaryColor={minisite.primary_color}
              size={48}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: minisite.primary_color }}
            >
              {minisite.name.charAt(0)}
            </div>
          )}
          <span 
            className={`font-bold text-lg tracking-wider ${textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {minisite.name}
          </span>
        </Link>

        {/* Right links */}
        <div className="hidden md:flex items-center justify-end gap-8 flex-1">
          {rightLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColor} ${hoverColor} transition-colors font-medium tracking-wide uppercase text-sm`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <MobileMenuButton textColor={textColor} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
    </div>
  );
}

// Minimal Navigation: Just logo and hamburger, clean look
function MinimalNav({ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 py-2">
        <Link href="/" className="flex items-center gap-2">
          <span 
            className={`font-bold text-2xl ${textColor}`}
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            {minisite.name}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColor} ${hoverColor} transition-colors text-sm font-light`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <MobileMenuButton textColor={textColor} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
    </div>
  );
}

// Split Navigation: Logo left, primary CTA right with links in between
function SplitNav({ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const mainLinks = navLinks.slice(0, -1); // All except contact
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20 py-3">
        <Link href="/" className="flex items-center gap-3">
          {minisite.logo_url ? (
            <LogoImage
              src={minisite.logo_url}
              alt={minisite.name}
              fallbackInitial={minisite.name.charAt(0)}
              primaryColor={minisite.primary_color}
              size={44}
            />
          ) : (
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: minisite.primary_color }}
            >
              {minisite.name.charAt(0)}
            </div>
          )}
          <span 
            className={`font-semibold text-lg hidden sm:block ${textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {minisite.name}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {mainLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColor} ${hoverColor} transition-colors font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full font-medium text-white transition-transform hover:scale-105"
            style={{ backgroundColor: minisite.accent_color }}
          >
            Contact Us
          </Link>
        </div>

        <MobileMenuButton textColor={textColor} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
    </div>
  );
}

// Stacked Navigation: Two rows - top with info/CTA, bottom with logo and links
function StackedNav({ minisite, navLinks, textColor, hoverColor, isMobileMenuOpen, setIsMobileMenuOpen, isScrolled }: any) {
  return (
    <div className={`transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
      {/* Top bar - hidden when scrolled */}
      <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
        <div className="bg-gray-900 text-white text-sm py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <span className="hidden sm:block opacity-80">Welcome to {minisite.name}</span>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="hover:underline">Get in Touch</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main nav */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-2">
            <Link href="/" className="flex items-center gap-3">
              {minisite.logo_url ? (
                <LogoImage
                  src={minisite.logo_url}
                  alt={minisite.name}
                  fallbackInitial={minisite.name.charAt(0)}
                  primaryColor={minisite.primary_color}
                  size={40}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: minisite.primary_color }}
                >
                  {minisite.name.charAt(0)}
                </div>
              )}
              <span 
                className="font-bold text-xl text-gray-900"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {minisite.name}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <MobileMenuButton textColor="text-gray-700" isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile menu button component
function MobileMenuButton({ textColor, isOpen, setIsOpen }: { textColor: string; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
      aria-label="Toggle menu"
    >
      <svg
        className={`w-6 h-6 ${textColor}`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isOpen ? (
          <path d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}
