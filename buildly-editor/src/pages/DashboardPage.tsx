import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Globe, Plus, Copy, Trash2, ExternalLink, Layout,
  LogOut, Zap, Clock, X, Layers,
} from 'lucide-react';
import { sitesApi, templatesApi, authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Button, Badge, Modal, Input, Spinner } from '../components/ui';
import { BUILTIN_TEMPLATES, TEMPLATE_PREVIEWS } from '../lib/templates';
import { clsx } from 'clsx';
import type { Site } from '../types';

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Template Card ─────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isLoading: boolean;
  onUse: () => void;
}> = ({ id, name, description, thumbnail, isLoading, onUse }) => {
  const preview = TEMPLATE_PREVIEWS[id];

  return (
    <div className="group border border-border rounded-xl overflow-hidden hover:border-zinc-500 transition-all bg-surface flex flex-col">
      {/* Visual preview */}
      <div className="h-36 relative overflow-hidden flex-shrink-0" style={{ background: preview?.bg || '#111' }}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          // Blank template visual
          <div className="w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2 opacity-20">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-md bg-white" />
              ))}
            </div>
          </div>
        )}

        {/* Element pills overlay */}
        {preview?.elements && preview.elements.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {preview.elements.map((el) => (
              <span key={el}
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: `${preview.accent}25`, color: preview.accent, border: `1px solid ${preview.accent}40` }}
              >
                {el}
              </span>
            ))}
          </div>
        )}

        {id === 'tpl-blank' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-zinc-600 text-sm font-medium">Empty Canvas</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-display font-semibold text-text text-sm">{name}</p>
          <p className="text-muted text-xs mt-0.5 leading-relaxed line-clamp-2">{description}</p>
        </div>

        <button
          onClick={onUse}
          disabled={isLoading}
          className={clsx(
            'mt-auto w-full py-2 rounded-lg text-xs font-semibold transition-all',
            isLoading
              ? 'bg-accent/30 text-accent/60 cursor-not-allowed'
              : 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-black',
          )}
        >
          {isLoading
            ? <span className="flex items-center justify-center gap-2"><Spinner size={12} /> Creating…</span>
            : `Use ${name}`}
        </button>
      </div>
    </div>
  );
};

// ── Templates Modal ───────────────────────────────────────────────────────────
const TemplatesModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const useTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesApi.use(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Template ready! Opening editor…');
      onClose();
      setLoadingId(null);
      navigate(`/editor/${res.data.data._id}`);
    },
    onError: (err: any) => {
      setLoadingId(null);
      toast.error(err.response?.data?.message || 'Failed to create site from template');
    },
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'blank', label: 'Blank' },
    { id: 'personal', label: 'Personal' },
    { id: 'business', label: 'Business' },
  ];

  const filtered = activeCategory === 'all'
    ? BUILTIN_TEMPLATES
    : BUILTIN_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <Modal open={open} onClose={() => { if (!loadingId) onClose(); }} title="" width="max-w-2xl">
      {/* Custom header */}
      <div className="-mt-6 -mx-6 px-6 pt-5 pb-4 border-b border-border mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-text">Choose a Template</h3>
            <p className="text-text-dim text-sm mt-0.5">Pick a starting point — you can customise everything.</p>
          </div>
          <button
            onClick={onClose}
            disabled={!!loadingId}
            className="text-muted hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                activeCategory === cat.id
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-muted border-border hover:text-text hover:border-zinc-600',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            id={tpl.id}
            name={tpl.name}
            description={tpl.description}
            thumbnail={tpl.thumbnail}
            isLoading={loadingId === tpl.id}
            onUse={() => useTemplateMutation.mutate(tpl.id)}
          />
        ))}
      </div>

      {/* Loading overlay when creating */}
      {loadingId && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <Spinner size={32} className="text-accent" />
          <p className="text-text font-medium text-sm">Setting up your site…</p>
          <p className="text-muted text-xs">This takes just a second</p>
        </div>
      )}
    </Modal>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [siteName, setSiteName] = useState('');

  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.list().then((r) => r.data.data as Site[]),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => sitesApi.create(name),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site created!');
      setShowCreate(false);
      setSiteName('');
      navigate(`/editor/${res.data.data._id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create site'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sitesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sites'] }); toast.success('Site deleted'); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => sitesApi.duplicate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sites'] }); toast.success('Site duplicated!'); },
  });

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
  };

  const sites: Site[] = sitesData || [];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <Layers size={14} className="text-black" />
            </div>
            <span className="font-display font-bold text-lg text-text">Buildly</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={user?.plan === 'pro' ? 'green' : 'default'}>
              <Zap size={10} />
              {user?.plan === 'pro' ? 'Pro' : 'Free'}
            </Badge>
            <span className="text-sm text-text-dim hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" icon={<LogOut size={14} />} onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-text">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-text-dim mt-1">
              {sites.length === 0
                ? 'Create your first site to get started.'
                : `${sites.length} site${sites.length !== 1 ? 's' : ''} in your workspace.`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md" icon={<Layout size={15} />} onClick={() => setShowTemplates(true)}>
              Templates
            </Button>
            <Button variant="accent" size="md" icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
              New Site
            </Button>
          </div>
        </div>

        {/* Sites grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-2xl overflow-hidden bg-surface animate-pulse">
                <div className="h-36 bg-panel" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-panel rounded w-3/4" />
                  <div className="h-3 bg-panel rounded w-1/2" />
                  <div className="h-8 bg-panel rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sites.length === 0 ? (
          <EmptyState onNew={() => setShowCreate(true)} onTemplate={() => setShowTemplates(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <SiteCard
                key={site._id}
                site={site}
                onEdit={() => navigate(`/editor/${site._id}`)}
                onDelete={() => { if (confirm(`Delete "${site.name}"? This cannot be undone.`)) deleteMutation.mutate(site._id); }}
                onDuplicate={() => duplicateMutation.mutate(site._id)}
              />
            ))}
            {/* Add new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="border-2 border-dashed border-border rounded-2xl h-48 flex flex-col items-center justify-center gap-3 text-muted hover:border-accent/40 hover:text-text-dim transition-all group"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">New Site</span>
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setSiteName(''); }} title="Create New Site">
        <div className="flex flex-col gap-4">
          <Input
            label="Site Name"
            placeholder="My Portfolio"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && siteName.trim() && createMutation.mutate(siteName.trim())}
            autoFocus
          />
          <p className="text-xs text-muted -mt-2">You can always rename it later.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setSiteName(''); }}>Cancel</Button>
            <Button
              variant="accent"
              loading={createMutation.isPending}
              disabled={!siteName.trim()}
              onClick={() => createMutation.mutate(siteName.trim())}
            >
              Create Site
            </Button>
          </div>
        </div>
      </Modal>

      {/* Templates modal */}
      <TemplatesModal open={showTemplates} onClose={() => setShowTemplates(false)} />
    </div>
  );
};

// ── Site Card ─────────────────────────────────────────────────────────────────
const SiteCard: React.FC<{
  site: Site;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ site, onEdit, onDelete, onDuplicate }) => (
  <div className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-zinc-600 transition-all">
    <div className="h-36 bg-panel relative cursor-pointer overflow-hidden" onClick={onEdit}>
      <div className="absolute inset-0 canvas-grid opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Globe size={22} className="text-zinc-700 mx-auto mb-1.5" />
          <span className="text-xs text-zinc-600 font-mono">/{site.slug}</span>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <Badge variant={site.status === 'published' ? 'green' : 'default'}>
          {site.status === 'published' ? '● Live' : '○ Draft'}
        </Badge>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-text text-sm truncate">{site.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted text-xs">
            <Clock size={11} />
            <span>{timeAgo(site.updatedAt || site.createdAt || new Date().toISOString())}</span>
            <span className="mx-1">·</span>
            <span>{site.pages?.length ?? 1} page{(site.pages?.length ?? 1) !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="xs" icon={<Copy size={13} />} onClick={onDuplicate} title="Duplicate" />
          {site.status === 'published' && (
            <Button variant="ghost" size="xs" icon={<ExternalLink size={13} />}
              onClick={() => window.open(`${import.meta.env.VITE_RENDERER_URL || 'http://localhost:3001'}/s/${site.slug}`, '_blank')}
              title="View live site"
            />
          )}
          <Button variant="danger" size="xs" icon={<Trash2 size={13} />} onClick={onDelete} title="Delete" />
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full mt-3" onClick={onEdit}>
        Open Editor →
      </Button>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onNew: () => void; onTemplate: () => void }> = ({ onNew, onTemplate }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
      <Globe size={28} className="text-muted" />
    </div>
    <h3 className="font-display text-xl font-semibold text-text mb-2">No sites yet</h3>
    <p className="text-text-dim text-sm max-w-xs mb-8">
      Create your first site from scratch or start with one of our ready-made templates.
    </p>
    <div className="flex gap-3">
      <Button variant="outline" size="md" icon={<Layout size={15} />} onClick={onTemplate}>Browse Templates</Button>
      <Button variant="accent" size="md" icon={<Plus size={15} />} onClick={onNew}>Create from Scratch</Button>
    </div>
  </div>
);
