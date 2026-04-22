import React, { useState } from 'react';
import type { Section, SitePage } from '../../types';
import { getSectionBgStyle } from '../../lib/sectionStyle';

interface Props { section: Section; pages?: SitePage[]; }

export const NavbarSection: React.FC<Props> = ({ section, pages = [] }) => {
  const { content: c, navLinks = [], styles, variant } = section;
  const [menuOpen, setMenuOpen] = useState(false);
  const bgStyle = getSectionBgStyle(styles);
  const links = navLinks.length > 0 ? navLinks : pages.map(p => ({ label: p.name, href: p.path }));

  const MenuIcon = () => (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
    </svg>
  );

  if (variant === 1) return (
    <nav style={{ ...bgStyle, borderBottom: `1px solid ${styles.borderColor}` }} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-xl" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{c.brand}</a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l, i) => <a key={i} href={l.href} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: styles.textColor }}>{l.label}</a>)}
        </div>
        {c.ctaText && <a href={c.ctaLink || '#'} className="hidden md:flex px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ background: styles.headingColor, color: styles.bg }}>{c.ctaText}</a>}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: styles.textColor }}><MenuIcon /></button>
      </div>
      {menuOpen && (
        <div style={{ background: styles.bg, borderTop: `1px solid ${styles.borderColor}` }} className="md:hidden px-6 py-4 flex flex-col gap-4">
          {links.map((l, i) => <a key={i} href={l.href} className="text-sm font-medium" style={{ color: styles.textColor }}>{l.label}</a>)}
          {c.ctaText && <a href={c.ctaLink || '#'} className="px-5 py-2 rounded-lg text-sm font-semibold text-center" style={{ background: styles.headingColor, color: styles.bg }}>{c.ctaText}</a>}
        </div>
      )}
    </nav>
  );

  if (variant === 2) return (
    <nav style={{ ...bgStyle }} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tight" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{c.brand}</a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l, i) => <a key={i} href={l.href} className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors" style={{ color: styles.mutedColor }}>{l.label}</a>)}
          {c.ctaText && <a href={c.ctaLink || '#'} className="px-5 py-2 rounded-lg text-sm font-bold border transition-all" style={{ borderColor: styles.accentColor, color: styles.accentColor }}>{c.ctaText}</a>}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: styles.textColor }}><MenuIcon /></button>
      </div>
      {menuOpen && (
        <div style={{ background: styles.bg, borderTop: `1px solid ${styles.borderColor}` }} className="md:hidden px-6 py-4 flex flex-col gap-3">
          {links.map((l, i) => <a key={i} href={l.href} className="text-sm font-medium py-1" style={{ color: styles.mutedColor }}>{l.label}</a>)}
        </div>
      )}
    </nav>
  );

  // Variant 3 — Centered
  return (
    <nav style={{ ...bgStyle, borderBottom: `1px solid ${styles.borderColor}` }} className="w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center h-10 pt-3">
          <a href="/" className="font-bold text-2xl" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{c.brand}</a>
        </div>
        <div className="hidden md:flex items-center justify-center gap-8 h-10 pb-2">
          {links.map((l, i) => <a key={i} href={l.href} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: styles.textColor }}>{l.label}</a>)}
          {c.ctaText && <a href={c.ctaLink || '#'} className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: styles.accentColor, color: styles.bg }}>{c.ctaText}</a>}
        </div>
      </div>
    </nav>
  );
};