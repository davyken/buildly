import React, { useState } from 'react';
import { SECTION_VARIANTS } from '../../lib/sectionDefaults';
import { useSiteStore } from '../../stores/siteStore';
import type { SectionType } from '../../types';

const ICONS: Record<SectionType, string> = {
  navbar: '🧭', hero: '✦', about: '🧑‍💼', services: '⚡',
  testimonials: '💬', faq: '❓', contact: '📨', footer: '⬛',
};

const THUMB_COLORS: Record<string, { bg: string; accent: string }> = {
  'nav-light': { bg: '#ffffff', accent: '#111827' },
  'nav-dark': { bg: '#0f172a', accent: '#6ee7b7' },
  'nav-center': { bg: '#f8fafc', accent: '#6366f1' },
  'hero-light': { bg: '#ffffff', accent: '#111827' },
  'hero-split': { bg: '#f9fafb', accent: '#6366f1' },
  'hero-dark': { bg: '#0f172a', accent: '#6ee7b7' },
  'hero-bg': { bg: '#374151', accent: '#f59e0b' },
  'about-split': { bg: '#ffffff', accent: '#6366f1' },
  'about-dark': { bg: '#0f172a', accent: '#6ee7b7' },
  'services-cards': { bg: '#f8fafc', accent: '#6366f1' },
  'services-list': { bg: '#0f172a', accent: '#6ee7b7' },
  'testimonials-cards': { bg: '#ffffff', accent: '#f59e0b' },
  'testimonials-featured': { bg: '#0f172a', accent: '#6ee7b7' },
  'faq-accordion': { bg: '#f8fafc', accent: '#6366f1' },
  'faq-twocol': { bg: '#0f172a', accent: '#6ee7b7' },
  'contact-split': { bg: '#ffffff', accent: '#6366f1' },
  'contact-centered': { bg: '#0f172a', accent: '#6ee7b7' },
  'footer-full': { bg: '#0f172a', accent: '#6ee7b7' },
  'footer-simple': { bg: '#111827', accent: '#6ee7b7' },
};

// Mini visual thumbnail for section variant
const SectionThumb: React.FC<{ thumb: string; label: string }> = ({ thumb }) => {
  const colors = THUMB_COLORS[thumb] || { bg: '#f9fafb', accent: '#6366f1' };
  const isDark = colors.bg.startsWith('#0') || colors.bg.startsWith('#1') || colors.bg.startsWith('#2') || colors.bg.startsWith('#3');

  return (
    <div className="w-full h-14 rounded-lg overflow-hidden flex flex-col gap-1 p-2" style={{ background: colors.bg }}>
      {/* Simulated layout lines */}
      <div className="flex gap-1 items-center">
        <div className="w-8 h-1.5 rounded-full opacity-70" style={{ background: colors.accent }} />
        <div className="flex-1" />
        {['faq', 'services', 'testimonials', 'contact', 'footer'].some(k => thumb.startsWith(k)) ? null : (
          <div className="w-8 h-1.5 rounded-full opacity-30" style={{ background: isDark ? '#ffffff' : '#111111' }} />
        )}
      </div>
      <div className="flex gap-1">
        <div className="flex-1 h-1 rounded-full opacity-20" style={{ background: isDark ? '#ffffff' : '#111111' }} />
        <div className="w-1/2 h-1 rounded-full opacity-20" style={{ background: isDark ? '#ffffff' : '#111111' }} />
      </div>
      <div className="flex gap-1 mt-auto">
        <div className="w-12 h-3 rounded opacity-80" style={{ background: colors.accent }} />
        <div className="w-10 h-3 rounded opacity-30 border" style={{ borderColor: isDark ? '#ffffff50' : '#11111150' }} />
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { addSection } = useSiteStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.keys(SECTION_VARIANTS).reduce((a, k) => ({ ...a, [k]: true }), {})
  );

  const toggle = (key: string) => setExpanded(s => ({ ...s, [key]: !s[key] }));

  return (
    <aside className="w-60 bg-panel border-r border-border flex flex-col overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-display font-semibold text-text-dim uppercase tracking-wider">Add Sections</p>
        <p className="text-xs text-muted mt-0.5">Click any variant to add it</p>
      </div>

      {/* Section groups */}
      <div className="flex-1 overflow-y-auto">
        {(Object.entries(SECTION_VARIANTS) as [SectionType, any][]).map(([type, group]) => (
          <div key={type} className="border-b border-border">
            <button
              onClick={() => toggle(type)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-text-dim uppercase tracking-wider">
                <span>{ICONS[type]}</span>
                {group.label}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="text-muted transition-transform" style={{ transform: expanded[type] ? 'rotate(180deg)' : 'none' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {expanded[type] && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                {group.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => addSection(type, v.id)}
                    className="flex flex-col gap-1.5 rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all hover:shadow-md group"
                    title={`Add ${v.label}`}
                  >
                    <SectionThumb thumb={v.thumb} label={v.label} />
                    <p className="text-xs text-muted group-hover:text-text-dim transition-colors px-2 pb-2 leading-tight">{v.label}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
