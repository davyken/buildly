import React from 'react';
import type { Section, SitePage } from '../../types';

interface Props { section: Section; pages?: SitePage[]; }

export const FooterSection: React.FC<Props> = ({ section, pages = [] }) => {
  const { content, styles, variant, items = [] } = section;
  const pageLinks = pages.map(p => ({ label: p.name, href: p.path }));

  if (variant === 1) return (
    <footer style={{ background: styles.bg }} className="w-full pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-black text-xl mb-3" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.brand}</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: styles.textColor }}>{content.tagline}</p>
            {content.email && <a href={`mailto:${content.email}`} className="text-xs block mb-1 hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{content.email}</a>}
            {content.phone && <a href={`tel:${content.phone}`} className="text-xs hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{content.phone}</a>}
          </div>
          {/* Pages */}
          {pageLinks.length > 0 && <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: styles.headingColor }}>Pages</p>
            <ul className="flex flex-col gap-3">
              {pageLinks.map((l, i) => <li key={i}><a href={l.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{l.label}</a></li>)}
            </ul>
          </div>}
          {/* Link groups */}
          {items.map(group => (
            <div key={group.id}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: styles.headingColor }}>{group.group}</p>
              <ul className="flex flex-col gap-3">
                {(group.links || []).map((l, i) => <li key={i}><a href={l.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{l.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: styles.borderColor }}>
          <p className="text-xs" style={{ color: styles.textColor }}>{content.copyright}</p>
          <div className="flex items-center gap-1 text-xs" style={{ color: styles.textColor }}>
            <span>Built with</span>
            <span className="font-bold" style={{ color: styles.accentColor }}>Buildly</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // Variant 2 — Simple centered
  return (
    <footer style={{ background: styles.bg }} className="w-full py-14">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="font-black text-2xl mb-3" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.brand}</p>
        <p className="text-sm mb-8" style={{ color: styles.textColor }}>{content.tagline}</p>
        {pageLinks.length > 0 && <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {pageLinks.map((l, i) => <a key={i} href={l.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{l.label}</a>)}
        </div>}
        <p className="text-xs" style={{ color: styles.textColor }}>{content.copyright}</p>
      </div>
    </footer>
  );
};
