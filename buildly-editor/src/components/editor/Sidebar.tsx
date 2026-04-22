import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Layers, PlusSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { SECTION_VARIANTS } from '../../lib/sectionDefaults';
import { useSiteStore } from '../../stores/siteStore';
import { LayersPanel } from '../editor/LayersPanel';
import type { SectionType } from '../../types';

const ICONS: Record<SectionType, string> = {
  navbar: '🧭', hero: '✦', about: '🧑‍💼', services: '⚡',
  testimonials: '💬', faq: '❓', contact: '📨', footer: '⬛',
};

const THUMB_COLORS: Record<string, { bg: string; accent: string }> = {
  'nav-light': { bg: '#ffffff', accent: '#111827' }, 'nav-dark': { bg: '#0f172a', accent: '#6ee7b7' },
  'nav-center': { bg: '#f8fafc', accent: '#6366f1' }, 'hero-light': { bg: '#ffffff', accent: '#111827' },
  'hero-split': { bg: '#f9fafb', accent: '#6366f1' }, 'hero-dark': { bg: '#0f172a', accent: '#6ee7b7' },
  'hero-bg': { bg: '#374151', accent: '#f59e0b' }, 'about-split': { bg: '#ffffff', accent: '#6366f1' },
  'about-dark': { bg: '#0f172a', accent: '#6ee7b7' }, 'services-cards': { bg: '#f8fafc', accent: '#6366f1' },
  'services-list': { bg: '#0f172a', accent: '#6ee7b7' }, 'testimonials-cards': { bg: '#ffffff', accent: '#f59e0b' },
  'testimonials-featured': { bg: '#0f172a', accent: '#6ee7b7' }, 'faq-accordion': { bg: '#f8fafc', accent: '#6366f1' },
  'faq-twocol': { bg: '#0f172a', accent: '#6ee7b7' }, 'contact-split': { bg: '#ffffff', accent: '#6366f1' },
  'contact-centered': { bg: '#0f172a', accent: '#6ee7b7' }, 'footer-full': { bg: '#0f172a', accent: '#6ee7b7' },
  'footer-simple': { bg: '#111827', accent: '#6ee7b7' },
};

const SectionThumb: React.FC<{ thumb: string }> = ({ thumb }) => {
  const colors = THUMB_COLORS[thumb] || { bg: '#f9fafb', accent: '#6366f1' };
  const isDark = ['#0', '#1', '#2', '#3'].some(p => colors.bg.startsWith(p));
  return (
    <div className="w-full h-14 rounded-lg overflow-hidden flex flex-col gap-1 p-2" style={{ background: colors.bg }}>
      <div className="flex gap-1 items-center">
        <div className="w-8 h-1.5 rounded-full opacity-70" style={{ background: colors.accent }} />
        <div className="flex-1" />
        <div className="w-6 h-1.5 rounded-full opacity-20" style={{ background: isDark ? '#fff' : '#111' }} />
      </div>
      <div className="flex gap-1">
        <div className="flex-1 h-1 rounded-full opacity-20" style={{ background: isDark ? '#fff' : '#111' }} />
        <div className="w-1/2 h-1 rounded-full opacity-15" style={{ background: isDark ? '#fff' : '#111' }} />
      </div>
      <div className="flex gap-1 mt-auto">
        <div className="w-12 h-3 rounded opacity-80" style={{ background: colors.accent }} />
        <div className="w-8 h-3 rounded opacity-25 border" style={{ borderColor: isDark ? '#fff4' : '#1114' }} />
      </div>
    </div>
  );
};

const ElementsTab: React.FC = () => {
  const { addSection } = useSiteStore();
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.keys(SECTION_VARIANTS).reduce((a, k) => ({ ...a, [k]: true }), {})
  );
  const toggle = (key: string) => setOpen(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex-1 overflow-y-auto">
      {(Object.entries(SECTION_VARIANTS) as [SectionType, any][]).map(([type, group]) => (
        <div key={type} className="border-b border-border">
          <button onClick={() => toggle(type)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2 text-xs font-semibold text-text-dim uppercase tracking-wider">
              <span>{ICONS[type]}</span>{group.label}
            </span>
            {open[type] ? <ChevronDown size={11} className="text-muted" /> : <ChevronRight size={11} className="text-muted" />}
          </button>
          {open[type] && (
            <div className="px-3 pb-3 grid grid-cols-2 gap-2">
              {group.variants.map((v: any) => (
                <button key={v.id} onClick={() => addSection(type, v.id)}
                  className="flex flex-col gap-1.5 rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all group"
                  title={`Add ${v.label}`}>
                  <SectionThumb thumb={v.thumb} />
                  <p className="text-xs text-muted group-hover:text-text-dim px-2 pb-2 leading-tight text-left">{v.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const [tab, setTab] = useState<'elements' | 'layers'>('elements');

  return (
    <aside className="w-56 bg-panel border-r border-border flex flex-col overflow-hidden flex-shrink-0">
      {/* Tab switcher */}
      <div className="flex border-b border-border flex-shrink-0">
        <button onClick={() => setTab('elements')}
          className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
            tab === 'elements' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text-dim')}>
          <PlusSquare size={13} /> Elements
        </button>
        <button onClick={() => setTab('layers')}
          className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
            tab === 'layers' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text-dim')}>
          <Layers size={13} /> Layers
        </button>
      </div>

      {tab === 'elements' && <ElementsTab />}
      {tab === 'layers' && <LayersPanel />}
    </aside>
  );
};