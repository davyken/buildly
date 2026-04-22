import React, { useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Monitor, Smartphone, EyeOff,
  Globe, Save, CheckCircle2, Loader2, Layers, WifiOff,
} from 'lucide-react';
import { sitesApi, publishApi } from '../lib/api';
import { useSiteStore } from '../stores/siteStore';
import { Sidebar } from '../components/editor/Sidebar';
import { Canvas } from '../components/editor/Canvas';
import { PropertiesPanel } from '../components/editor/PropertiesPanel';
import { Button, Badge, Tooltip, Spinner } from '../components/ui';
import type { Site } from '../types';

// ── Page tabs ─────────────────────────────────────────────────────────────────
const PageManager: React.FC = () => {
  const { site, activePageId, setActivePage, addPage, removePage } = useSiteStore();
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  if (!site) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const path = '/' + newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addPage(newName.trim(), path);
    setNewName(''); setAdding(false);
  };

  return (
    <div className="h-9 bg-surface border-t border-border flex items-center px-3 gap-1 overflow-x-auto flex-shrink-0">
      <Layers size={12} className="text-muted flex-shrink-0 mr-1" />
      {site.pages.map(page => (
        <button key={page.id} onClick={() => setActivePage(page.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all flex-shrink-0 group ${
            activePageId === page.id ? 'bg-accent/15 text-accent border border-accent/25' : 'text-muted hover:text-text hover:bg-white/5'
          }`}>
          {page.name}
          {site.pages.length > 1 && (
            <span onClick={e => { e.stopPropagation(); if (confirm(`Delete "${page.name}"?`)) removePage(page.id); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all ml-0.5">×</span>
          )}
        </button>
      ))}
      {adding ? (
        <div className="flex items-center gap-1">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            className="bg-surface border border-accent/50 rounded px-2 py-1 text-xs text-text outline-none w-28" placeholder="Page name" />
          <button onClick={handleAdd} className="text-xs text-accent px-2 py-1 hover:bg-white/5 rounded">✓</button>
          <button onClick={() => setAdding(false)} className="text-xs text-muted px-1 hover:bg-white/5 rounded">✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted hover:text-text hover:bg-white/5 transition-all flex-shrink-0 ml-1">
          + Add Page
        </button>
      )}
    </div>
  );
};

// ── Main Editor ───────────────────────────────────────────────────────────────
export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    site, isDirty, isSaving, setIsSaving, setIsDirty, setSite,
    previewMode, setPreviewMode, mobilePreview, setMobilePreview,
  } = useSiteStore();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch site ──────────────────────────────────────────────────────────────
  // staleTime: 0 ensures we always get fresh data when navigating back to editor.
  // This is the fix for "sections disappear when returning to editor" — the store
  // resets on navigation, and without fresh data sections look gone.
  const { data: fetchedSite, isLoading, error } = useQuery({
    queryKey: ['site', id],
    queryFn: () => sitesApi.get(id!).then(r => r.data.data as Site),
    enabled: !!id,
    staleTime: 0,   // always fetch fresh — store resets on nav, we need real data
    retry: 1,
  });

  // Load site into store once query resolves
  // TanStack Query v5 removed onSuccess — useEffect is the correct pattern
  useEffect(() => {
    if (fetchedSite) setSite(fetchedSite);
  }, [fetchedSite]);

  useEffect(() => {
    if (error) { toast.error('Could not load site'); navigate('/dashboard'); }
  }, [error]);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    if (!site || isSaving) return;
    setIsSaving(true);
    try {
      await sitesApi.update(site._id, { pages: site.pages, meta: site.meta, name: site.name });
      // Do NOT call setSite(response) — would overwrite local state.
      // Just invalidate the query cache so next navigation gets fresh data.
      qc.invalidateQueries({ queryKey: ['site', id] });
      setIsDirty(false);
    } catch {
      toast.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  }, [site, isSaving, id]);

  useEffect(() => {
    if (!isDirty || !site) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(doSave, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [isDirty, site?.pages]);

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        doSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doSave]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Publish ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!site) return;
    // Save first to ensure latest sections are persisted before publishing
    if (isDirty) {
      await doSave();
    }
    const tid = toast.loading('Publishing…');
    try {
      const { data } = await publishApi.publish(site._id);
      const jobId = data.data.jobId;
      const poll = setInterval(async () => {
        const { data: job } = await publishApi.jobStatus(jobId);
        if (job.data.state === 'completed') {
          clearInterval(poll);
          toast.dismiss(tid);
          const { data: info } = await publishApi.info(site._id);
          setSite({ ...site, status: 'published', publishedAt: info.data.publishedAt });
          toast.success(`🚀 Live! ${info.data.publicUrl}`, { duration: 8000 });
        } else if (job.data.state === 'failed') {
          clearInterval(poll);
          toast.dismiss(tid);
          toast.error('Publish failed — try again');
        }
      }, 1200);
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.message || 'Publish failed');
    }
  };

  const handleUnpublish = async () => {
    if (!site || !confirm('Take this site offline?')) return;
    try {
      await publishApi.unpublish(site._id);
      setSite({ ...site, status: 'draft', publishedAt: undefined });
      toast.success('Site taken offline');
    } catch { toast.error('Failed to unpublish'); }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading || !site) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
          <Layers size={18} className="text-black" />
        </div>
        <Spinner size={24} className="text-accent" />
        <p className="text-sm text-muted">Loading editor…</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* Toolbar */}
      <header className="h-12 bg-surface border-b border-border flex items-center px-3 gap-2 flex-shrink-0 z-50">
        <Tooltip label="Back to dashboard">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/dashboard')} />
        </Tooltip>
        <div className="w-px h-5 bg-border mx-1" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display font-semibold text-sm text-text truncate max-w-[160px]">{site.name}</span>
          <Badge variant={site.status === 'published' ? 'green' : 'default'}>
            {site.status === 'published' ? '● Live' : '○ Draft'}
          </Badge>
        </div>
        <div className="text-xs ml-2 flex items-center gap-1.5">
          {isSaving
            ? <span className="text-muted flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Saving</span>
            : isDirty ? <span className="text-yellow-400/70">● Unsaved</span>
            : <span className="text-muted flex items-center gap-1"><CheckCircle2 size={11} /> Saved</span>}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          <Tooltip label="Desktop preview">
            <Button variant={previewMode && !mobilePreview ? 'accent' : 'ghost'} size="sm" icon={<Monitor size={14} />}
              onClick={() => { setPreviewMode(true); setMobilePreview(false); }} />
          </Tooltip>
          <Tooltip label="Mobile preview">
            <Button variant={previewMode && mobilePreview ? 'accent' : 'ghost'} size="sm" icon={<Smartphone size={14} />}
              onClick={() => { setPreviewMode(true); setMobilePreview(true); }} />
          </Tooltip>
          {previewMode && (
            <Tooltip label="Exit preview">
              <Button variant="outline" size="sm" icon={<EyeOff size={14} />} onClick={() => setPreviewMode(false)}>Exit</Button>
            </Tooltip>
          )}
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <Tooltip label="Save (Ctrl+S)">
          <Button variant="ghost" size="sm" icon={<Save size={14} />} loading={isSaving}
            onClick={() => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); doSave(); }} />
        </Tooltip>
        {site.status === 'published' ? (
          <>
            <Button variant="ghost" size="sm" icon={<Globe size={14} />}
              onClick={() => window.open(`${import.meta.env.VITE_RENDERER_URL || 'http://localhost:3001'}/s/${site.slug}`, '_blank')}>
              View Live
            </Button>
            <Button variant="outline" size="sm" icon={<WifiOff size={14} />} onClick={handleUnpublish}>Unpublish</Button>
          </>
        ) : (
          <Button variant="accent" size="sm" icon={<Globe size={14} />} onClick={handlePublish}>Publish</Button>
        )}
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <Sidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Canvas />
          <PageManager />
        </div>
        {!previewMode && <PropertiesPanel />}
      </div>
    </div>
  );
};