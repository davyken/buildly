import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Site, SitePage, Section, SectionType } from '../types';
import { createSection } from '../lib/sectionDefaults';

interface HistoryEntry {
  pages: SitePage[];
  activePageId: string | null;
}

interface SiteStore {
  site: Site | null;
  activePageId: string | null;
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  previewMode: boolean;
  mobilePreview: boolean;
  history: HistoryEntry[];
  historyIndex: number;

  setSite: (site: Site) => void;
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
  setPreviewMode: (v: boolean) => void;
  setMobilePreview: (v: boolean) => void;

  activePage: () => SitePage | null;
  setActivePage: (id: string) => void;
  addPage: (name: string, path: string) => void;
  removePage: (id: string) => void;

  selectSection: (id: string | null) => void;
  selectedSection: () => Section | null;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  addSection: (type: SectionType, variantId: number, afterId?: string) => void;
  updateSection: (id: string, changes: Partial<Section>) => void;
  updateSectionContent: (id: string, key: string, value: string) => void;
  updateSectionStyle: (id: string, key: string, value: string) => void;
  updateSectionItem: (sectionId: string, itemId: string, changes: Record<string, any>) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  changeVariant: (id: string, type: SectionType, variantId: number) => void;
}

function clonePages(pages: SitePage[]): SitePage[] {
  return JSON.parse(JSON.stringify(pages));
}

export const useSiteStore = create<SiteStore>()((set, get) => ({
  site: null,
  activePageId: null,
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,
  previewMode: false,
  mobilePreview: false,
  history: [],
  historyIndex: -1,

  setSite: (site) => {
    const migratedPages = site.pages.map((p: any) => ({
      ...p,
      sections: Array.isArray(p.sections) ? p.sections : [],
    }));
    set({
      site: { ...site, pages: migratedPages },
      activePageId: migratedPages[0]?.id ?? null,
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },

  setIsSaving: (v) => set({ isSaving: v }),
  setIsDirty: (v) => set({ isDirty: v }),
  setPreviewMode: (v) => set({ previewMode: v, selectedSectionId: null }),
  setMobilePreview: (v) => set({ mobilePreview: v }),

  activePage: () => {
    const { site, activePageId } = get();
    return site?.pages.find((p) => p.id === activePageId) ?? null;
  },

  setActivePage: (id) => set({ activePageId: id, selectedSectionId: null }),

  addPage: (name, path) => {
    const { site } = get();
    if (!site) return;
    get().pushHistory();
    const newPage: SitePage = { id: uuidv4(), name, path, sections: [], meta: { title: name } };
    set({ site: { ...site, pages: [...site.pages, newPage] }, isDirty: true });
  },

  removePage: (id) => {
    const { site, activePageId } = get();
    if (!site || site.pages.length <= 1) return;
    get().pushHistory();
    const pages = site.pages.filter((p) => p.id !== id);
    set({ site: { ...site, pages }, activePageId: activePageId === id ? pages[0].id : activePageId, isDirty: true });
  },

  selectSection: (id) => set({ selectedSectionId: id }),

  selectedSection: () => {
    const { site, activePageId, selectedSectionId } = get();
    if (!site || !activePageId || !selectedSectionId) return null;
    const page = site.pages.find((p) => p.id === activePageId);
    return page?.sections.find((s) => s.id === selectedSectionId) ?? null;
  },

  // ── History ────────────────────────────────────────────────────────────────
  pushHistory: () => {
    const { site, activePageId, history, historyIndex } = get();
    if (!site) return;
    const entry: HistoryEntry = { pages: clonePages(site.pages), activePageId };
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(entry);
    const limited = trimmed.slice(-50); // keep max 50
    set({ history: limited, historyIndex: limited.length - 1 });
  },

  undo: () => {
    const { history, historyIndex, site } = get();
    if (historyIndex <= 0 || !site) return;
    const prev = history[historyIndex - 1];
    set({ site: { ...site, pages: prev.pages }, activePageId: prev.activePageId, historyIndex: historyIndex - 1, isDirty: true, selectedSectionId: null });
  },

  redo: () => {
    const { history, historyIndex, site } = get();
    if (historyIndex >= history.length - 1 || !site) return;
    const next = history[historyIndex + 1];
    set({ site: { ...site, pages: next.pages }, activePageId: next.activePageId, historyIndex: historyIndex + 1, isDirty: true, selectedSectionId: null });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // ── Sections ────────────────────────────────────────────────────────────────
  addSection: (type, variantId, afterId) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const newSection = createSection(type, variantId);
    const pages = site.pages.map((p) => {
      if (p.id !== activePageId) return p;
      const sections = [...p.sections];
      if (afterId) {
        const idx = sections.findIndex((s) => s.id === afterId);
        sections.splice(idx + 1, 0, newSection);
      } else {
        sections.push(newSection);
      }
      return { ...p, sections };
    });
    set({ site: { ...site, pages }, isDirty: true, selectedSectionId: newSection.id });
  },

  updateSection: (id, changes) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => (s.id === id ? { ...s, ...changes } : s)) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  updateSectionContent: (id, key, value) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  updateSectionStyle: (id, key, value) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => s.id === id ? { ...s, styles: { ...s.styles, [key]: value } } : s) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  updateSectionItem: (sectionId, itemId, changes) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => s.id === sectionId ? { ...s, items: s.items?.map((item) => item.id === itemId ? { ...item, ...changes } : item) } : s) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  addSectionItem: (sectionId) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const newItem = {
      id: uuidv4(), title: 'New Item', description: 'Description here', icon: '✦',
      question: 'New Question?', answer: 'Answer here.',
      name: 'New Person', role: 'Title, Company',
      quote: 'Great experience!', label: 'Link', href: '#', group: 'Links',
      links: [{ label: 'Example', href: '#' }],
    };
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => s.id === sectionId ? { ...s, items: [...(s.items ?? []), newItem] } : s) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  removeSectionItem: (sectionId, itemId) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const pages = site.pages.map((p) =>
      p.id === activePageId
        ? { ...p, sections: p.sections.map((s) => s.id === sectionId ? { ...s, items: s.items?.filter((i) => i.id !== itemId) } : s) }
        : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },

  deleteSection: (id) => {
    const { site, activePageId, selectedSectionId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const pages = site.pages.map((p) =>
      p.id === activePageId ? { ...p, sections: p.sections.filter((s) => s.id !== id) } : p
    );
    set({ site: { ...site, pages }, isDirty: true, selectedSectionId: selectedSectionId === id ? null : selectedSectionId });
  },

  duplicateSection: (id) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const page = site.pages.find((p) => p.id === activePageId);
    if (!page) return;
    const original = page.sections.find((s) => s.id === id);
    if (!original) return;
    const copy: Section = { ...JSON.parse(JSON.stringify(original)), id: uuidv4() };
    const pages = site.pages.map((p) => {
      if (p.id !== activePageId) return p;
      const idx = p.sections.findIndex((s) => s.id === id);
      const sections = [...p.sections];
      sections.splice(idx + 1, 0, copy);
      return { ...p, sections };
    });
    set({ site: { ...site, pages }, isDirty: true, selectedSectionId: copy.id });
  },

  moveSectionUp: (id) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const pages = site.pages.map((p) => {
      if (p.id !== activePageId) return p;
      const sections = [...p.sections];
      const idx = sections.findIndex((s) => s.id === id);
      if (idx <= 0) return p;
      [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
      return { ...p, sections };
    });
    set({ site: { ...site, pages }, isDirty: true });
  },

  moveSectionDown: (id) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const pages = site.pages.map((p) => {
      if (p.id !== activePageId) return p;
      const sections = [...p.sections];
      const idx = sections.findIndex((s) => s.id === id);
      if (idx >= sections.length - 1) return p;
      [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
      return { ...p, sections };
    });
    set({ site: { ...site, pages }, isDirty: true });
  },

  reorderSections: (fromIndex, toIndex) => {
    const { site, activePageId } = get();
    if (!site || !activePageId || fromIndex === toIndex) return;
    get().pushHistory();
    const pages = site.pages.map((p) => {
      if (p.id !== activePageId) return p;
      const sections = [...p.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...p, sections };
    });
    set({ site: { ...site, pages }, isDirty: true });
  },

  changeVariant: (id, type, variantId) => {
    const { site, activePageId } = get();
    if (!site || !activePageId) return;
    get().pushHistory();
    const newSection = createSection(type, variantId);
    const page = site.pages.find((p) => p.id === activePageId);
    const old = page?.sections.find((s) => s.id === id);
    const merged: Section = {
      ...newSection, id,
      content: { ...newSection.content, ...(old?.content ?? {}) },
      items: old?.items ?? newSection.items,
    };
    const pages = site.pages.map((p) =>
      p.id === activePageId ? { ...p, sections: p.sections.map((s) => s.id === id ? merged : s) } : p
    );
    set({ site: { ...site, pages }, isDirty: true });
  },
}));