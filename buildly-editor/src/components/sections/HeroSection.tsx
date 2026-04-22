import React from 'react';
import type { Section } from '../../types';

interface Props { section: Section; }

export const HeroSection: React.FC<Props> = ({ section }) => {
  const { content, styles, variant } = section;
  const opacity = parseFloat(content.overlayOpacity || '0.5');

  // Variant 1 — Centered, light
  if (variant === 1) return (
    <section style={{ background: styles.bg }} className="w-full min-h-[90vh] flex items-center">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        {content.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ color: styles.accentColor, borderColor: `${styles.accentColor}40`, background: `${styles.accentColor}10` }}>{content.badge}</div>}
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: styles.mutedColor }}>{content.subheading}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {content.ctaText && <a href={content.ctaLink} className="px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ background: styles.headingColor, color: styles.bg }}>{content.ctaText}</a>}
          {content.cta2Text && <a href={content.cta2Link} className="px-8 py-4 rounded-xl text-base font-semibold border transition-all hover:scale-105" style={{ borderColor: styles.borderColor, color: styles.textColor }}>{content.cta2Text} →</a>}
        </div>
        {content.image && <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: styles.borderColor }}><img src={content.image} alt="Hero" className="w-full h-64 md:h-96 object-cover" /></div>}
      </div>
    </section>
  );

  // Variant 2 — Split layout
  if (variant === 2) return (
    <section style={{ background: styles.bg }} className="w-full min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{content.badge}</div>}
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h1>
          <p className="text-base md:text-lg mb-10 leading-relaxed" style={{ color: styles.mutedColor }}>{content.subheading}</p>
          <div className="flex flex-wrap gap-4">
            {content.ctaText && <a href={content.ctaLink} className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: styles.accentColor, color: styles.bg }}>{content.ctaText}</a>}
            {content.cta2Text && <a href={content.cta2Link} className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: styles.borderColor, color: styles.textColor }}>{content.cta2Text}</a>}
          </div>
        </div>
        {content.image && <div className="rounded-3xl overflow-hidden shadow-2xl"><img src={content.image} alt="Hero" className="w-full h-full min-h-[400px] object-cover" /></div>}
      </div>
    </section>
  );

  // Variant 3 — Dark cinematic
  if (variant === 3) return (
    <section style={{ background: styles.bg }} className="w-full min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full" style={{ background: styles.accentColor, filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full" style={{ background: styles.accentColor, filter: 'blur(100px)' }} />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
        {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border" style={{ borderColor: `${styles.accentColor}50`, color: styles.accentColor }}>{content.badge}</div>}
        <h1 className="text-5xl md:text-8xl font-black leading-[1.02] tracking-tighter mb-8" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: styles.mutedColor }}>{content.subheading}</p>
        {content.ctaText && <a href={content.ctaLink} className="inline-flex px-10 py-4 rounded-xl text-base font-bold transition-all hover:scale-105" style={{ background: styles.accentColor, color: '#000000' }}>{content.ctaText}</a>}
      </div>
    </section>
  );

  // Variant 4 — BG image with overlay
  return (
    <section className="w-full min-h-screen flex items-center relative overflow-hidden">
      {content.image && <img src={content.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${opacity})` }} />
      <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
        {content.badge && <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-white/30 text-white/80">{content.badge}</div>}
        <h1 className="text-5xl md:text-8xl font-black leading-[1.02] tracking-tight mb-6 text-white" style={{ fontFamily: 'Syne, sans-serif', textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}>{content.heading}</h1>
        <p className="text-xl max-w-2xl mx-auto mb-12 text-white/80 leading-relaxed">{content.subheading}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {content.ctaText && <a href={content.ctaLink} className="px-8 py-4 rounded-xl text-base font-bold shadow-2xl transition-all hover:scale-105" style={{ background: styles.accentColor, color: '#000000' }}>{content.ctaText}</a>}
          {content.cta2Text && <a href={content.cta2Link} className="px-8 py-4 rounded-xl text-base font-semibold border border-white/40 text-white transition-all hover:bg-white/10">{content.cta2Text}</a>}
        </div>
      </div>
    </section>
  );
};
