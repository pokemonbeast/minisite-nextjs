'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minisite } from '@/lib/supabase';

interface NavigationProps {
  minisite: Minisite;
}

export function Navigation({ minisite }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const themeConfig = minisite.theme_config || {};
  const navStyle = themeConfig.navStyle || 'solid';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavClasses = () => {
    const base = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
    
    switch (navStyle) {
      case 'transparent':
        return `${base} ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
      case 'floating':
        return `${base} mx-4 mt-4 rounded-2xl ${isScrolled ? 'bg-white/95 shadow-lg' : 'bg-white/80 backdrop-blur'}`;
      default:
        return `${base} bg-white shadow-sm`;
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const textColor = navStyle === 'transparent' && !isScrolled ? 'text-white' : 'text-gray-700';

  return (
    <nav className={getNavClasses()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {minisite.logo_url ? (
              <Image
                src={minisite.logo_url}
                alt={minisite.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: minisite.primary_color }}
              >
                {minisite.name.charAt(0)}
              </div>
            )}
            <span 
              className={`font-semibold text-lg ${textColor}`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {minisite.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${textColor} hover:opacity-70 transition-opacity font-medium`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
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
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

