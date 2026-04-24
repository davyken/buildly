import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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

// ── Templates Page ────────────────────────────────────────────────────────────
export const TemplatesPage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
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

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
  };

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
              Templates
            </h1>
            <p className="text-text-dim mt-1">
              Choose a starting point for your site
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex gap-2">
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-3">
              <Spinner size={32} className="text-accent" />
              <p className="text-text font-medium text-sm">Setting up your site…</p>
              <p className="text-muted text-xs">This takes just a second</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};