import React from 'react';
import type { Section } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; }

export const AboutSection: React.FC<Props> = ({ section }) => {
  const { content: c, styles, variant } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const cs = getContentStyle(styles);
  const stats = [
    { v: c.stat1Value, l: c.stat1Label }, { v: c.stat2Value, l: c.stat2Label },
    { v: c.stat3Value, l: c.stat3Label }, { v: c.stat4Value, l: c.stat4Label },
  ].filter(s => s.v);

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFontStyle: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', DM Sans, sans-serif` : 'DM Sans, sans-serif',
  };

  if (variant === 1) return (
    <section id="about" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{c.badge}</div>}
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.body}</p>
            <div className="flex flex-col gap-3 mb-10">
              {[c.point1, c.point2, c.point3].filter(Boolean).map((p, i) => <p key={i} className="text-sm font-medium" style={{ color: styles.textColor }}>{p}</p>)}
            </div>
            {stats.length > 0 && <div className="grid grid-cols-3 gap-6 pt-8 border-t" style={{ borderColor: styles.borderColor }}>
              {stats.map((s, i) => (<div key={i}><p className="text-2xl md:text-3xl font-black" style={{ color: styles.headingColor, ...fontStyle }}>{s.v}</p><p className="text-xs mt-1" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{s.l}</p></div>))}
            </div>}
            {c.ctaText && <a href={c.ctaLink || '#'} className="inline-flex mt-8 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 border" style={{ borderColor: styles.headingColor, color: styles.headingColor }}>{c.ctaText} →</a>}
          </div>
          {c.image && <div className="relative"><div className="rounded-2xl overflow-hidden shadow-2xl"><img src={c.image} alt="About" className="w-full h-full min-h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10" style={{ background: `${styles.accentColor}20` }} /></div>}
        </div>
      </div>
    </section>
  );

  return (
    <section id="about" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          {c.image && <div className="rounded-2xl overflow-hidden shadow-2xl order-last md:order-first"><img src={c.image} alt="About" className="w-full min-h-[400px] object-cover" /></div>}
          <div>
            {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}20`, color: styles.accentColor }}>{c.badge}</div>}
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
            <p className="text-base leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.body}</p>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: styles.borderColor }}>
            {stats.map((s, i) => (<div key={i} className="py-10 px-8 text-center" style={{ background: styles.bg }}><p className="text-4xl md:text-5xl font-black mb-2" style={{ color: styles.accentColor, fontFamily: 'Syne, sans-serif' }}>{s.v}</p><p className="text-sm" style={{ color: styles.mutedColor }}>{s.l}</p></div>))}
          </div>
        )}
      </div>
    </section>
  );
};