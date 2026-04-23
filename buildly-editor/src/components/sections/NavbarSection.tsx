import React, { useState, useEffect } from 'react';
import type { Section, SitePage } from '../../types';
import { getSectionBgStyle } from '../../lib/sectionStyle';

/**
 * Smart link handler — works in both editor preview and on published site.
 * - href starting with # → smooth scroll to section id on same page
 * - href starting with / → navigate to another page of the site
 * - href starting with http → open external link
 */
function NavLink({ href, label, style, className, onClick }: { href: string; label: string; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // For / links — let the browser navigate normally (React Router handles it on published site)
  };

  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={(e) => { handleClick(e); onClick?.(); }}
      className={className}
      style={style}
    >
      {label}
    </a>
  );
}

export const NavbarSection: React.FC<Props> = ({ section, pages = [] }) => {
  const { content: c, navLinks = [], styles, variant } = section;
  const [menuOpen, setMenuOpen] = useState(false);

  // Logo mode: 'both' | 'logo' | 'text'
  const logoMode = c.logoMode || 'both';

  // Auto-generate links from pages if no nav links defined
  const links = navLinks.length > 0
    ? navLinks
    : pages.map(p => ({ label: p.name, href: p.path === '/' ? '/' : p.path }));

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFont: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', sans-serif` : 'DM Sans, sans-serif',
  };

  const MenuIcon = () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
    </svg>
  );

  const navBase: React.CSSProperties = {
    ...bgStyle,
    transition: 'box-shadow 0.2s',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
    fontFamily: bodyFont.fontFamily,
  };

  if (variant === 1) return (
    <nav style={{ ...navBase, borderBottom: `1px solid ${styles.borderColor}` }} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          {logoMode !== 'text' && c.logo && (
            <img src={c.logo} alt="Logo" className="h-8 w-auto" style={{ ...fontStyle, color: styles.headingColor }} />
          )}
          {logoMode !== 'logo' && c.brand && (
            <span style={{ ...fontStyle, color: styles.headingColor }} className="font-bold text-lg sm:text-xl">{c.brand}</span>
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              style={{ color: styles.textColor, fontFamily: bodyFont.fontFamily }}
              className="text-sm font-medium transition-colors hover:opacity-70" />
          ))}
        </div>

        {c.ctaText && (
          <NavLink href={c.ctaLink || '#'} label={c.ctaText}
            className="hidden md:flex px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 shrink-0"
            style={{ background: styles.headingColor, color: styles.bg, fontFamily: bodyFont.fontFamily }} />
        )}

        <button className="md:hidden ml-2" onClick={() => setMenuOpen(!menuOpen)} style={{ color: styles.textColor }}>
          <MenuIcon />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: styles.bg, borderTop: `1px solid ${styles.borderColor}` }} className="md:hidden px-4 py-4 flex flex-col gap-3">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              onClick={() => setMenuOpen(false)}
              style={{ color: styles.textColor, fontFamily: bodyFont.fontFamily }}
              className="text-sm font-medium py-1 block" />
          ))}
          {c.ctaText && (
            <NavLink href={c.ctaLink || '#'} label={c.ctaText}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-center block"
              style={{ background: styles.headingColor, color: styles.bg, fontFamily: bodyFont.fontFamily }} />
          )}
        </div>
      )}
    </nav>
  );

  if (variant === 2) return (
    <nav style={navBase} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          {logoMode !== 'text' && c.logo && (
            <img src={c.logo} alt="Logo" className="h-9 w-auto" style={{ ...fontStyle, color: styles.headingColor }} />
          )}
          {logoMode !== 'logo' && c.brand && (
            <span style={{ ...fontStyle, color: styles.headingColor }} className="font-bold text-xl tracking-tight">{c.brand}</span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-5">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              style={{ color: styles.mutedColor, fontFamily: bodyFont.fontFamily }}
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:opacity-100" />
          ))}
          {c.ctaText && (
            <NavLink href={c.ctaLink || '#'} label={c.ctaText}
              className="px-5 py-2 rounded-lg text-sm font-bold border transition-all"
              style={{ borderColor: styles.accentColor, color: styles.accentColor, fontFamily: bodyFont.fontFamily }} />
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: styles.textColor }}><MenuIcon /></button>
      </div>

      {menuOpen && (
        <div style={{ background: styles.bg, borderTop: `1px solid ${styles.borderColor}` }} className="md:hidden px-4 py-4 flex flex-col gap-3">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              onClick={() => setMenuOpen(false)}
              style={{ color: styles.mutedColor }} className="text-sm font-medium py-1 block" />
          ))}
          {c.ctaText && (
            <NavLink href={c.ctaLink || '#'} label={c.ctaText}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-center block"
              style={{ background: styles.headingColor, color: styles.bg, fontFamily: bodyFont.fontFamily }} />
          )}
        </div>
      )}
    </nav>
  );

  // Variant 3 — Centered logo
  return (
    <nav style={{ ...navBase, borderBottom: `1px solid ${styles.borderColor}` }} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-10 pt-3">
          <div className="flex items-center gap-2">
            {logoMode !== 'text' && c.logo && (
              <img src={c.logo} alt="Logo" className="h-10 w-auto" style={{ ...fontStyle, color: styles.headingColor }} />
            )}
            {logoMode !== 'logo' && c.brand && (
              <span style={{ ...fontStyle, color: styles.headingColor }} className="font-bold text-2xl">{c.brand}</span>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 h-10 pb-2">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              style={{ color: styles.textColor, fontFamily: bodyFont.fontFamily }}
              className="text-sm font-medium transition-colors hover:opacity-70" />
          ))}
          {c.ctaText && (
            <NavLink href={c.ctaLink || '#'} label={c.ctaText}
              className="px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: styles.accentColor, color: styles.bg, fontFamily: bodyFont.fontFamily }} />
          )}
        </div>
        <button className="md:hidden absolute right-4 top-3" onClick={() => setMenuOpen(!menuOpen)} style={{ color: styles.textColor }}><MenuIcon /></button>
      </div>
      {menuOpen && (
        <div style={{ background: styles.bg, borderTop: `1px solid ${styles.borderColor}` }} className="md:hidden px-4 py-4 flex flex-col gap-3">
          {links.map((l, i) => (
            <NavLink key={i} href={l.href} label={l.label}
              onClick={() => setMenuOpen(false)}
              style={{ color: styles.textColor }} className="text-sm font-medium py-1 block" />
          ))}
          {c.ctaText && (
            <NavLink href={c.ctaLink || '#'} label={c.ctaText}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-center block"
              style={{ background: styles.headingColor, color: styles.bg, fontFamily: bodyFont.fontFamily }} />
          )}
        </div>
      )}
    </nav>
  );
};

type Props = {
  section: Section;
  pages?: SitePage[];
};