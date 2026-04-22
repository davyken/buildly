import React from 'react';
import type { Section } from '../../types';

interface Props { section: Section; }

export const ServicesSection: React.FC<Props> = ({ section }) => {
  const { content, styles, variant, items = [] } = section;

  if (variant === 1) return (
    <section id="services" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{content.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
          {content.subheading && <p className="text-base leading-relaxed" style={{ color: styles.mutedColor }}>{content.subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="p-7 rounded-2xl border transition-all hover:shadow-lg group" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
              <div className="text-3xl mb-5">{item.icon}</div>
              <h3 className="text-lg font-bold mb-3" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: styles.mutedColor }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Variant 2 — Dark feature list
  return (
    <section id="services" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{content.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
          {content.subheading && <p className="text-base leading-relaxed" style={{ color: styles.mutedColor }}>{content.subheading}</p>}
        </div>
        <div className="flex flex-col gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-6 items-start p-7 rounded-2xl border transition-all hover:border-opacity-50" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${styles.accentColor}15` }}>{item.icon}</div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: styles.mutedColor }}>{item.description}</p>
              </div>
              <div className="ml-auto flex-shrink-0 text-3xl font-black opacity-10" style={{ color: styles.accentColor, fontFamily: 'Syne, sans-serif' }}>0{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
