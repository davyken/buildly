import React, { useRef } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, Trash2, Copy, Plus, Eye, EyeOff } from 'lucide-react';
import { useSiteStore } from '../../stores/siteStore';
import { SectionRenderer } from '../sections/SectionRenderer';
import { Tooltip } from '../ui';
import type { Section } from '../../types';

// ── Section wrapper with controls ─────────────────────────────────────────────
const SectionBlock: React.FC<{ section: Section; index: number; total: number }> = ({ section, index, total }) => {
  const {
    selectedSectionId, selectSection,
    deleteSection, duplicateSection, moveSectionUp, moveSectionDown,
    updateSection, site,
  } = useSiteStore();

  const isSelected = selectedSectionId === section.id;
  return (
    <div
      className={clsx('relative group transition-all', isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-transparent')}
      onClick={(e) => { e.stopPropagation(); selectSection(section.id); }}
    >
      {/* Section content */}
      <div className={clsx('transition-opacity', section.hidden && 'opacity-40')}>
        <SectionRenderer
          section={section}
          pages={site?.pages}
          preview={false}
          siteSlug={site?.slug}
        />
      </div>

      {/* Hover/Select overlay controls */}
      <div className={clsx(
        'absolute inset-0 pointer-events-none transition-opacity',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}>
        {/* Top label */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 pointer-events-auto"
          style={{ background: isSelected ? 'rgba(110,231,183,0.15)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">{section.type}</span>
          <div className="flex items-center gap-0.5">
            <Tooltip label="Move up">
              <button onClick={(e) => { e.stopPropagation(); moveSectionUp(section.id); }} disabled={index === 0}
                className="p-1 rounded hover:bg-white/20 text-white disabled:opacity-30 transition-colors">
                <ChevronUp size={13} />
              </button>
            </Tooltip>
            <Tooltip label="Move down">
              <button onClick={(e) => { e.stopPropagation(); moveSectionDown(section.id); }} disabled={index === total - 1}
                className="p-1 rounded hover:bg-white/20 text-white disabled:opacity-30 transition-colors">
                <ChevronDown size={13} />
              </button>
            </Tooltip>
            <Tooltip label={section.hidden ? 'Show' : 'Hide'}>
              <button onClick={(e) => { e.stopPropagation(); updateSection(section.id, { hidden: !section.hidden }); }}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors">
                {section.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </Tooltip>
            <Tooltip label="Duplicate">
              <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors">
                <Copy size={13} />
              </button>
            </Tooltip>
            <Tooltip label="Delete">
              <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this section?')) deleteSection(section.id); }}
                className="p-1 rounded hover:bg-red-500/40 text-white transition-colors">
                <Trash2 size={13} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Left selection bar */}
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ background: '#6ee7b7' }} />}
      </div>

      {/* Insert section below */}
      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <InsertButton afterId={section.id} />
      </div>
    </div>
  );
};

// ── Insert button between sections ────────────────────────────────────────────
const InsertButton: React.FC<{ afterId: string }> = ({ afterId }) => {
  const [open, setOpen] = React.useState(false);
  const { addSection } = useSiteStore();
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const QUICK_ADD: { type: string; label: string }[] = [
    { type: 'about', label: 'About' }, { type: 'services', label: 'Services' },
    { type: 'testimonials', label: 'Testimonials' }, { type: 'faq', label: 'FAQ' },
    { type: 'contact', label: 'Contact' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-lg transition-all hover:scale-105"
        style={{ background: '#6ee7b7', color: '#000000' }}
      >
        <Plus size={12} /> Insert section
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-panel border border-border rounded-xl shadow-panel py-2 min-w-[140px] z-50">
          {QUICK_ADD.map(({ type, label }) => (
            <button key={type} onClick={(e) => { e.stopPropagation(); addSection(type as any, 1, afterId); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-xs text-text-dim hover:text-text hover:bg-white/5 transition-colors">
              + {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Canvas ───────────────────────────────────────────────────────────────
export const Canvas: React.FC = () => {
  const store = useSiteStore();
  const { site, selectSection, previewMode, mobilePreview, addSection } = store;
  const activePage = store.activePage;
  const page = activePage();

  if (!site || !page) {
    return (
      <div className="flex-1 canvas-grid flex items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  const containerStyle = previewMode && mobilePreview
    ? { maxWidth: '390px', margin: '0 auto', boxShadow: '0 0 0 8px #333, 0 0 0 12px #222', borderRadius: '40px', overflow: 'hidden' }
    : {};

  return (
    <div className="flex-1 overflow-auto" style={{ background: previewMode ? '#1a1a1a' : '#0e0e10' }}
      onClick={() => selectSection(null)}>
      <div style={{ padding: previewMode ? '40px 20px' : '0', minHeight: '100%' }}>
        <div style={containerStyle}>
          {/* White site background */}
          <div style={{ background: '#ffffff', minHeight: '100vh' }} onClick={(e) => e.stopPropagation()}>
            {(page.sections ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-12">
                <div className="text-center max-w-sm">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="font-display font-bold text-lg text-zinc-400 mb-2">Canvas is empty</h3>
                  <p className="text-sm text-zinc-600 mb-8">Add sections from the left sidebar to start building your page.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(['navbar', 'hero', 'about', 'services', 'contact', 'footer'] as const).map(type => (
                      <button key={type} onClick={() => addSection(type, 1)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-700 text-zinc-400 hover:border-accent/50 hover:text-accent transition-all capitalize">
                        + {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {(page.sections ?? []).map((section, idx) => (
                  previewMode ? (
                    <SectionRenderer key={section.id} section={section} pages={site.pages} preview siteSlug={site.slug} />
                  ) : (
                    <SectionBlock key={section.id} section={section} index={idx} total={(page.sections ?? []).length} />
                  )
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};