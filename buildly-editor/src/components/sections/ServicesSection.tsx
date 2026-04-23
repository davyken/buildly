import React from 'react';
import type { Section } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; }

export const ServicesSection: React.FC<Props> = ({ section }) => {
  const { content: c, styles, variant, items = [] } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const cs = getContentStyle(styles);

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFontStyle: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', DM Sans, sans-serif` : 'DM Sans, sans-serif',
  };

  if (variant === 1) return (
    <section id="services" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{c.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
          {c.subheading && <p className="text-base leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <a key={item.id} href={item.href || undefined}
              className={`p-7 rounded-2xl border transition-all hover:shadow-lg group block ${item.href ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
              onClick={e => !item.href && e.preventDefault()}>
              <div className="text-3xl mb-5">{item.icon}</div>
              <h3 className="text-lg font-bold mb-3" style={{ color: styles.headingColor, ...fontStyle }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{item.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section id="services" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-5xl mx-auto px-6" style={cs}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{c.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
          {c.subheading && <p className="text-base leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>}
        </div>
        <div className="flex flex-col gap-5">
          {items.map((item, idx) => (
            <a key={item.id} href={item.href || undefined}
              className={`flex gap-6 items-start p-7 rounded-2xl border transition-all ${item.href ? 'hover:border-opacity-50 cursor-pointer' : 'cursor-default'}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
              onClick={e => !item.href && e.preventDefault()}>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${styles.accentColor}15` }}>{item.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2" style={{ color: styles.headingColor, ...fontStyle }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{item.description}</p>
              </div>
              <div className="ml-auto flex-shrink-0 text-3xl font-black opacity-10" style={{ color: styles.accentColor, ...fontStyle }}>0{idx + 1}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};