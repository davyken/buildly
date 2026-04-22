import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Undo2, Redo2, Eye, EyeOff, Monitor, Smartphone,
  ZoomIn, ZoomOut, Globe, Loader2, Save, CheckCircle2, Wifi, WifiOff
} from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { sitesApi, publishApi } from '../../lib/api';
import { Button, Badge, Tooltip } from '../ui';

export const EditorToolbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    site, isDirty, isSaving, setIsSaving, setIsDirty,
    undo, redo, history, historyIndex,
    previewMode, setPreviewMode, mobilePreview, setMobilePreview,
    zoom, zoomIn, zoomOut, resetZoom,
    setSite,
  } = useCanvasStore();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with 2s debounce
  useEffect(() => {
    if (!isDirty || !site) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await doSave();
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [isDirty, site?.pages]);

  const doSave = useCallback(async () => {
    if (!site || isSaving) return;
    setIsSaving(true);
    try {
      const res = await sitesApi.update(site._id, { pages: site.pages, meta: site.meta, name: site.name, globalBackground: site.globalBackground });
      setSite(res.data.data);
      setIsDirty(false);
    } catch {
      toast.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  }, [site, isSaving]);

  const handleManualSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    doSave();
  };

  const handlePublish = async () => {
    if (!site) return;
    const tid = toast.loading('Publishing...');
    try {
      const { data } = await publishApi.publish(site._id);
      toast.dismiss(tid);
      // Poll job status
      const jobId = data.data.jobId;
      const poll = setInterval(async () => {
        const { data: job } = await publishApi.jobStatus(jobId);
        if (job.data.state === 'completed') {
          clearInterval(poll);
          const { data: info } = await publishApi.info(site._id);
          setSite({ ...site, status: 'published', publishedAt: info.data.publishedAt });
          toast.success(`🚀 Site is live! ${info.data.publicUrl}`, { duration: 5000 });
        } else if (job.data.state === 'failed') {
          clearInterval(poll);
          toast.error('Publish failed. Try again.');
        }
      }, 1000);
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.message || 'Publish failed');
    }
  };

  const handleUnpublish = async () => {
    if (!site || !confirm('Take your site offline?')) return;
    try {
      await publishApi.unpublish(site._id);
      setSite({ ...site, status: 'draft', publishedAt: undefined });
      toast.success('Site taken offline');
    } catch { toast.error('Failed to unpublish'); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (mod && e.key === 's') { e.preventDefault(); handleManualSave(); }
      if (mod && e.shiftKey && e.key === 'P') { e.preventDefault(); setPreviewMode(!previewMode); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, previewMode]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="h-12 bg-surface border-b border-border flex items-center px-3 gap-2 flex-shrink-0 z-50">
      {/* Back */}
      <Tooltip label="Back to dashboard">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />} onClick={() => navigate('/dashboard')} />
      </Tooltip>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Site name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-display font-semibold text-sm text-text truncate max-w-[160px]">
          {site?.name || 'Untitled'}
        </span>
        {site?.status === 'published'
          ? <Badge variant="green"><Wifi size={9} /> Live</Badge>
          : <Badge variant="default"><WifiOff size={9} /> Draft</Badge>
        }
      </div>

      {/* Save status */}
      <div className="flex items-center gap-1.5 text-xs ml-2">
        {isSaving ? (
          <span className="text-muted flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving…</span>
        ) : isDirty ? (
          <span className="text-yellow-500/70 flex items-center gap-1">● Unsaved</span>
        ) : (
          <span className="text-muted flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <Tooltip label="Undo (Ctrl+Z)">
          <Button variant="ghost" size="sm" icon={<Undo2 size={14} />} disabled={!canUndo} onClick={undo} />
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Y)">
          <Button variant="ghost" size="sm" icon={<Redo2 size={14} />} disabled={!canRedo} onClick={redo} />
        </Tooltip>
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Tooltip label="Zoom out">
          <Button variant="ghost" size="sm" icon={<ZoomOut size={14} />} onClick={zoomOut} />
        </Tooltip>
        <button onClick={resetZoom} className="text-xs font-mono text-text-dim hover:text-text w-10 text-center">
          {Math.round(zoom * 100)}%
        </button>
        <Tooltip label="Zoom in">
          <Button variant="ghost" size="sm" icon={<ZoomIn size={14} />} onClick={zoomIn} />
        </Tooltip>
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Preview toggle */}
      <div className="flex items-center gap-0.5">
        <Tooltip label={previewMode ? 'Exit preview (Ctrl+Shift+P)' : 'Preview (Ctrl+Shift+P)'}>
          <Button
            variant={previewMode ? 'accent' : 'ghost'} size="sm"
            icon={previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Exit' : 'Preview'}
          </Button>
        </Tooltip>
        {previewMode && (
          <>
            <Tooltip label="Desktop">
              <Button variant={!mobilePreview ? 'outline' : 'ghost'} size="sm" icon={<Monitor size={14} />} onClick={() => setMobilePreview(false)} />
            </Tooltip>
            <Tooltip label="Mobile">
              <Button variant={mobilePreview ? 'outline' : 'ghost'} size="sm" icon={<Smartphone size={14} />} onClick={() => setMobilePreview(true)} />
            </Tooltip>
          </>
        )}
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Save + Publish */}
      <Tooltip label="Save (Ctrl+S)">
        <Button variant="ghost" size="sm" icon={<Save size={14} />} onClick={handleManualSave} loading={isSaving} />
      </Tooltip>
      {site?.status === 'published' ? (
        <Button variant="outline" size="sm" icon={<Globe size={14} />} onClick={handleUnpublish}>
          Unpublish
        </Button>
      ) : (
        <Button variant="accent" size="sm" icon={<Globe size={14} />} onClick={handlePublish}>
          Publish
        </Button>
      )}
    </header>
  );
};
