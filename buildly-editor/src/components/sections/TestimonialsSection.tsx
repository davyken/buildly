import React from 'react';
import type { Section } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; }

const Stars = ({ color }: { color: string }) => (
  <div className="flex gap-0.5 mt-3">{[...Array(5)].map((_, i) => <span key={i} style={{ color }}>★</span>)}</div>
);

export const TestimonialsSection: React.FC<Props> = ({ section }) => {
  const { content: c, styles, variant, items = [] } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const cs = getContentStyle(styles);

  if (variant === 1) return (
    <section id="testimonials" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{c.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{c.heading}</h2>
          {c.subheading && <p className="text-base" style={{ color: styles.mutedColor }}>{c.subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="p-7 rounded-2xl border flex flex-col" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
              <Stars color={styles.accentColor} />
              <p className="text-sm leading-relaxed mt-4 flex-1 italic" style={{ color: styles.textColor }}>"{item.quote}"</p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t" style={{ borderColor: styles.borderColor }}>
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />}
                <div>
                  <p className="text-sm font-bold" style={{ color: styles.headingColor }}>{item.name}</p>
                  <p className="text-xs" style={{ color: styles.mutedColor }}>{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const featured = items[0];
  return (
    <section id="testimonials" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-4xl mx-auto px-6 text-center" style={cs}>
        {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-8" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{c.badge}</div>}
        {featured && <>
          <div className="text-7xl font-black mb-6 leading-none" style={{ color: styles.accentColor, fontFamily: 'serif' }}>"</div>
          <p className="text-xl md:text-2xl leading-relaxed font-medium mb-10 italic" style={{ color: styles.textColor }}>{featured.quote}</p>
          <div className="flex items-center justify-center gap-4">
            {featured.image && <img src={featured.image} alt={featured.name} className="w-14 h-14 rounded-full border-2 object-cover" style={{ borderColor: styles.accentColor }} />}
            <div className="text-left">
              <p className="font-bold text-base" style={{ color: styles.headingColor }}>{featured.name}</p>
              <p className="text-sm" style={{ color: styles.mutedColor }}>{featured.role}</p>
            </div>
          </div>
          <Stars color={styles.accentColor} />
        </>}
      </div>
    </section>
  );
};