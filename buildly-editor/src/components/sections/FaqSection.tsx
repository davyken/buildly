import React, { useState } from 'react';
import type { Section } from '../../types';

interface Props { section: Section; }

export const FaqSection: React.FC<Props> = ({ section }) => {
  const { content, styles, variant, items = [] } = section;
  const [openId, setOpenId] = useState<string | null>(null);

  if (variant === 1) return (
    <section id="faq" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{content.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
          {content.subheading && <p className="text-base" style={{ color: styles.mutedColor }}>{content.subheading}</p>}
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="border rounded-xl overflow-hidden transition-all" style={{ borderColor: styles.borderColor, background: styles.cardBg }}>
              <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                <span className="font-semibold text-sm md:text-base pr-4" style={{ color: styles.headingColor }}>{item.question}</span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform text-xs font-bold" style={{ background: `${styles.accentColor}20`, color: styles.accentColor, transform: openId === item.id ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
              </button>
              {openId === item.id && <div className="px-6 pb-5"><p className="text-sm leading-relaxed" style={{ color: styles.mutedColor }}>{item.answer}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Variant 2 — Dark two-column
  const half = Math.ceil(items.length / 2);
  return (
    <section id="faq" style={{ background: styles.bg }} className="w-full py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          {content.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{content.badge}</div>}
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: styles.headingColor, fontFamily: 'Syne, sans-serif' }}>{content.heading}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[items.slice(0, half), items.slice(half)].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map(item => (
                <div key={item.id} className="p-6 rounded-2xl border" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
                  <div className="flex gap-3 mb-3">
                    <span className="text-base font-black" style={{ color: styles.accentColor, fontFamily: 'Syne, sans-serif' }}>Q.</span>
                    <p className="font-semibold text-sm" style={{ color: styles.headingColor }}>{item.question}</p>
                  </div>
                  <p className="text-sm leading-relaxed pl-6" style={{ color: styles.mutedColor }}>{item.answer}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
