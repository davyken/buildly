import React, { useState } from 'react';
import type { Section } from '../../types';
import { getSectionBgStyle, getOverlayStyle, getContentStyle } from '../../lib/sectionStyle';

interface Props { section: Section; preview?: boolean; siteSlug?: string; }

const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const ContactSection: React.FC<Props> = ({ section, preview, siteSlug }) => {
  const { content: c, styles, variant } = section;
  const bgStyle = getSectionBgStyle(styles);
  const overlay = getOverlayStyle(styles);
  const cs = getContentStyle(styles);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const fontStyle: React.CSSProperties = {
    fontFamily: styles.headingFont ? `"${styles.headingFont}", 'Inter', Syne, sans-serif` : 'Syne, sans-serif',
  };
  const bodyFontStyle: React.CSSProperties = {
    fontFamily: styles.bodyFont ? `"${styles.bodyFont}", 'Inter', DM Sans, sans-serif` : 'DM Sans, sans-serif',
  };

  const waUrl = `https://wa.me/${c.whatsappPhone}?text=${encodeURIComponent(c.whatsappMessage || 'Hello!')}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    setSending(true);
    const form = e.target as HTMLFormElement;
    const fields: Record<string, string> = {};
    ['name', 'email', 'phone', 'message'].forEach(k => {
      const el = form.elements.namedItem(k) as HTMLInputElement | null;
      if (el?.value) fields[k] = el.value;
    });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/forms/submit/${siteSlug}/${section.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: 'contact', fields }),
      });
      if (res.ok) setSubmitted(true);
    } catch { setSubmitted(true); }
    setSending(false);
  };

  const ContactForm = () => submitted ? (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="text-xl font-bold mb-2" style={{ color: styles.headingColor, ...fontStyle }}>{c.successMessage || 'Message sent!'}</h3>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {[
        { n: 'name', l: 'Full Name', t: 'text', p: 'John Doe', r: true },
        { n: 'email', l: 'Email', t: 'email', p: 'john@example.com', r: true },
        { n: 'phone', l: 'Phone', t: 'tel', p: '+237 600 000 000', r: false },
      ].map(f => (
        <div key={f.n} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: styles.mutedColor }}>{f.l}{f.r && ' *'}</label>
          <input name={f.n} type={f.t} placeholder={f.p} required={f.r} className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: styles.cardBg, borderColor: styles.borderColor, color: styles.textColor }} />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: styles.mutedColor }}>Message *</label>
        <textarea name="message" rows={4} required placeholder="Your message..." className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none" style={{ background: styles.cardBg, borderColor: styles.borderColor, color: styles.textColor }} />
      </div>
      <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 mt-2 disabled:opacity-60" style={{ background: styles.headingColor, color: styles.bg }}>
        {sending ? 'Sending…' : c.submitLabel || 'Send Message'}
      </button>
    </form>
  );

  if (variant === 1) return (
    <section id="contact" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-6xl mx-auto px-6" style={cs}>
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border" style={{ borderColor: `${styles.accentColor}40`, color: styles.accentColor, background: `${styles.accentColor}10` }}>{c.badge}</div>}
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
            <p className="text-base leading-relaxed mb-10" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>
            <div className="flex flex-col gap-5">
              {c.email && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${styles.accentColor}15` }}>✉️</div><a href={`mailto:${c.email}`} className="text-sm font-medium" style={{ color: styles.textColor }}>{c.email}</a></div>}
              {c.phone && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${styles.accentColor}15` }}>📞</div><a href={`tel:${c.phone}`} className="text-sm font-medium" style={{ color: styles.textColor }}>{c.phone}</a></div>}
              {c.address && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${styles.accentColor}15` }}>📍</div><p className="text-sm font-medium" style={{ color: styles.textColor }}>{c.address}</p></div>}
              {c.whatsappPhone && <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm w-fit transition-all hover:scale-105" style={{ background: '#25D366', color: '#fff' }}><WaIcon /> Chat on WhatsApp</a>}
            </div>
          </div>
          <div className="p-8 rounded-2xl border" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section id="contact" style={{ ...bgStyle, position: 'relative' }} className="w-full py-24 md:py-32">
      {overlay && <div style={overlay} />}
      <div className="max-w-2xl mx-auto px-6 text-center" style={cs}>
        {c.badge && <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5" style={{ background: `${styles.accentColor}15`, color: styles.accentColor }}>{c.badge}</div>}
        <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4" style={{ color: styles.headingColor, ...fontStyle }}>{c.heading}</h2>
        <p className="text-base mb-10 leading-relaxed" style={{ color: styles.mutedColor, ...bodyFontStyle }}>{c.subheading}</p>
        {c.whatsappPhone && <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base mb-8 transition-all hover:scale-105" style={{ background: '#25D366', color: '#fff' }}><WaIcon /> Chat on WhatsApp</a>}
        <div className="text-center mb-6" style={{ color: styles.mutedColor }}><span className="text-sm">— or send a message —</span></div>
        <div className="p-8 rounded-2xl border text-left" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};