import React from 'react';
import type { Section } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; }

export const HeroSection: React.FC<Props> = ({ section }) => {
  const { content: c, styles, variant } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const contentStyle = getContentStyle(styles);
  const inlineOverlayOpacity = parseFloat(c.overlayOpacity || '0.5');

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFontStyle: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', DM Sans, sans-serif` : 'DM Sans, sans-serif',
  };

  if (variant === 1) return (
    <section id="hero" style={{ ...bgStyle, position: 'relative' }} className="w-full min-h-[90vh] flex items-center">
      {overlay && <div style={overlay} />}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center w-full" style={contentStyle}>
        {c.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ color: styles.accentColor, borderColor: `${styles.accentColor}40`, background: `${styles.accentColor}10` }}>{c.badge}</div>}
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {c.ctaText && <a href={c.ctaLink || '#'} className="px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ background: styles.headingColor, color: styles.bg }}>{c.ctaText}</a>}
          {c.cta2Text && <a href={c.cta2Link || '#'} className="px-8 py-4 rounded-xl text-base font-semibold border transition-all hover:scale-105" style={{ borderColor: styles.borderColor, color: styles.textColor }}>{c.cta2Text} →</a>}
        </div>
        {c.image && <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: styles.borderColor }}><img src={c.image} alt="Hero" className="w-full h-64 md:h-96 object-cover" /></div>}
      </div>
    </section>
  );

  if (variant === 2) return (
    <section id="hero" style={{ ...bgStyle, position: 'relative' }} className="w-full min-h-screen flex items-center">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center w-full" style={contentStyle}>
        <div>
          {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{c.badge}</div>}
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h1>
          <p className="text-base md:text-lg mb-10 leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>
          <div className="flex flex-wrap gap-4">
            {c.ctaText && <a href={c.ctaLink || '#'} className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: styles.accentColor, color: styles.bg }}>{c.ctaText}</a>}
            {c.cta2Text && <a href={c.cta2Link || '#'} className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: styles.borderColor, color: styles.textColor }}>{c.cta2Text}</a>}
          </div>
        </div>
        {c.image && <div className="rounded-3xl overflow-hidden shadow-2xl"><img src={c.image} alt="Hero" className="w-full h-full min-h-[400px] object-cover" /></div>}
      </div>
    </section>
  );

  if (variant === 3) return (
    <section id="hero" style={{ ...bgStyle, position: 'relative' }} className="w-full min-h-screen flex items-center overflow-hidden">
      {overlay && <div style={overlay} />}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full" style={{ background: styles.accentColor, filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full" style={{ background: styles.accentColor, filter: 'blur(100px)' }} />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 py-28 text-center w-full" style={contentStyle}>
        {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border" style={{ borderColor: `${styles.accentColor}50`, color: styles.accentColor }}>{c.badge}</div>}
        <h1 className="text-5xl md:text-8xl font-black leading-[1.02] tracking-tighter mb-8" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {c.ctaText && <a href={c.ctaLink || '#'} className="inline-flex px-10 py-4 rounded-xl text-base font-bold transition-all hover:scale-105" style={{ background: styles.accentColor, color: '#000000' }}>{c.ctaText}</a>}
          {c.cta2Text && <a href={c.cta2Link || '#'} className="px-8 py-4 rounded-xl text-base font-semibold border border-white/30 text-white transition-all hover:bg-white/10">{c.cta2Text}</a>}
        </div>
      </div>
    </section>
  );

  // Variant 4 — BG image with overlay (uses content.image as bg + content.overlayOpacity)
  return (
    <section id="hero" className="w-full min-h-screen flex items-center relative overflow-hidden">
      {c.image && <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {/* Section-level bg image overlay (from styles) */}
      {overlay && <div style={overlay} />}
      {/* Hero-specific overlay using content.overlayOpacity */}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${inlineOverlayOpacity})` }} />
      <div className="relative max-w-4xl mx-auto px-6 py-28 text-center w-full" style={{ zIndex: 1 }}>
        {c.badge && <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-white/30 text-white/80">{c.badge}</div>}
        <h1 className="text-5xl md:text-8xl font-black leading-[1.02] tracking-tight mb-6 text-white" style={{ ...fontStyle, textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}>{c.heading}</h1>
        <p className="text-xl max-w-2xl mx-auto mb-12 text-white/80 leading-relaxed" style={{ ...bodyFontStyle }}>{c.subheading}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {c.ctaText && <a href={c.ctaLink || '#'} className="px-8 py-4 rounded-xl text-base font-bold shadow-2xl transition-all hover:scale-105" style={{ background: styles.accentColor, color: '#000000' }}>{c.ctaText}</a>}
          {c.cta2Text && <a href={c.cta2Link || '#'} className="px-8 py-4 rounded-xl text-base font-semibold border border-white/40 text-white transition-all hover:bg-white/10">{c.cta2Text}</a>}
        </div>
      </div>
    </section>
  );
};