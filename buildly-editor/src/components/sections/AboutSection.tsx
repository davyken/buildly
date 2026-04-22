import React from 'react';
import type { Section } from '../../types';

interface Props { section: Section; }

export const AboutSection: React.FC<Props> = ({ section }) => {
  const { content, styles, variant } = section;
  const stats = [
    { v: content.stat1Value, l: content.stat1Label },
    { v: content.stat2Value, l: content.stat2Label },
    { v: content.stat3Value, l: content.stat3Label },
    { v: content.stat4Value, l: content.stat4Label },
  ].filter(s => s.v);

  // Variant 1 — Text left, image right
  if (variant === 1) return (
    <section id="about" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{content.badge}</div>}
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: styles.mutedColor }}>{content.body}</p>
            <div className="flex flex-col gap-3 mb-10">
              {[content.point1, content.point2, content.point3].filter(Boolean).map((p, i) => (
                <p key={i} className="text-sm font-medium" style={{ color: styles.textColor }}>{p}</p>
              ))}
            </div>
            {stats.length > 0 && <div className="grid grid-cols-3 gap-6 pt-8 border-t" style={{ borderColor: styles.borderColor }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl md:text-3xl font-black" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{s.v}</p>
                  <p className="text-xs mt-1" style={{ color: styles.mutedColor }}>{s.l}</p>
                </div>
              ))}
            </div>}
            {content.ctaText && <a href={content.ctaLink} className="inline-flex mt-8 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 border" style={{ borderColor: styles.headingColor, color: styles.headingColor }}>{content.ctaText} →</a>}
          </div>
          {content.image && <div className="relative"><div className="rounded-2xl overflow-hidden shadow-2xl"><img src={content.image} alt="About" className="w-full h-full min-h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10" style={{ background: `${styles.accentColor}20` }} /></div>}
        </div>
      </div>
    </section>
  );

  // Variant 2 — Dark with large stats
  return (
    <section id="about" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          {content.image && <div className="rounded-2xl overflow-hidden shadow-2xl order-last md:order-first"><img src={content.image} alt="About" className="w-full min-h-[400px] object-cover" /></div>}
          <div>
            {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}20`, color: styles.accentColor }}>{content.badge}</div>}
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
            <p className="text-base leading-relaxed" style={{ color: styles.mutedColor }}>{content.body}</p>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: styles.borderColor }}>
            {stats.map((s, i) => (
              <div key={i} className="py-10 px-8 text-center" style={{ background: styles.bg }}>
                <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: styles.accentColor, fontFamily: 'Syne, sans-serif' }}>{s.v}</p>
                <p className="text-sm" style={{ color: styles.mutedColor }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
