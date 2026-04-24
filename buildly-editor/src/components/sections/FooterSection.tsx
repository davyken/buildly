import React from 'react';
import type { Section, SitePage } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; pages?: SitePage[]; }

export const FooterSection: React.FC<Props> = ({ section, pages = [] }) => {
  const { content: c, styles, variant, items = [] } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const cs = getContentStyle(styles);
  const pageLinks = pages.map(p => ({ label: p.name, href: p.path }));

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFontStyle: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', DM Sans, sans-serif` : 'DM Sans, sans-serif',
  };

  if (variant === 1) return (
    <footer style={{ ...bgStyle, position: 'relative' }} className="w-full pt-20 pb-10">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <p className="font-black text-xl mb-3" style={{ color: styles.headingColor, ...fontStyle }}>{c.brand}</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: styles.textColor, ...bodyFontStyle }}>{c.tagline}</p>
            {c.email && <a href={`mailto:${c.email}`} className="text-xs block mb-1 hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{c.email}</a>}
            {c.phone && <a href={`tel:${c.phone}`} className="text-xs hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{c.phone}</a>}
          </div>
          {pageLinks.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: styles.headingColor }}>Pages</p>
              <ul className="flex flex-col gap-3">
                {pageLinks.map((l, i) => <li key={i}><a href={l.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{l.label}</a></li>)}
              </ul>
            </div>
          )}
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
          <p className="text-xs" style={{ color: styles.textColor }}>{c.copyright}</p>
          <div className="flex items-center gap-1 text-xs" style={{ color: styles.textColor }}>
            <span>Built with</span>
            <span className="font-bold" style={{ color: styles.accentColor }}>Buildly</span>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <footer style={{ ...bgStyle, position: 'relative' }} className="w-full py-14">
      {overlay && <div style={overlay} />}
      <div className="max-w-4xl mx-auto px-6 text-center" style={cs}>
        <p className="font-black text-2xl mb-3" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{c.brand}</p>
        <p className="text-sm mb-8" style={{ color: styles.textColor }}>{c.tagline}</p>
        {pageLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            {pageLinks.map((l, i) => <a key={i} href={l.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: styles.textColor }}>{l.label}</a>)}
          </div>
        )}
        <p className="text-xs" style={{ color: styles.textColor }}>{c.copyright}</p>
      </div>
    </footer>
  );
};