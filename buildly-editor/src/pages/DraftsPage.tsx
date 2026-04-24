import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus, Copy, Trash2, Clock, Layers, FileText
} from 'lucide-react';
import { sitesApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Button, Badge, Modal, Input, Spinner } from '../components/ui';
import type { Site } from '../types';

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SiteCard: React.FC<{
  site: Site;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ site, onEdit, onDelete, onDuplicate }) => (
  <div className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-zinc-600 transition-all">
    <div className="h-36 relative cursor-pointer overflow-hidden rounded-t-2xl" onClick={onEdit} style={{ background: '#f8fafc' }}>
      <div className="absolute inset-0 canvas-grid opacity-20 flex items-center justify-center">
        <div className="text-center text-zinc-500 text-sm font-medium">
          <Layers size={24} className="mx-auto mb-2 opacity-50" />
          <div>/ {site.slug}</div>
          <div className="text-xs opacity-75 mt-1">Draft</div>
        </div>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="default">○ Draft</Badge>
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
          <Button variant="danger" size="xs" icon={<Trash2 size={13} />} onClick={onDelete} title="Delete" />
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full mt-3" onClick={onEdit}>
        Continue Editing →
      </Button>
    </div>
  </div>
);

const EmptyState: React.FC<{ onNew: () => void }> = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
      <FileText size={28} className="text-muted" />
    </div>
    <h3 className="font-display text-xl font-semibold text-text mb-2">No drafts yet</h3>
    <p className="text-text-dim text-sm max-w-xs mb-8">
      Start a new project to see it here.
    </p>
    <Button variant="accent" size="md" icon={<Plus size={15} />} onClick={onNew}>
      New Site
    </Button>
  </div>
);

export const DraftsPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [siteName, setSiteName] = useState('');

  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['draft-sites'],
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

  const sites: Site[] = (sitesData || []).filter(site => site.status !== 'published');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Draft Sites
          </h1>
          <p className="text-text-dim mt-1">
            {sites.length === 0
              ? 'No drafts yet. Start a new project to see it here.'
              : `${sites.length} draft site${sites.length !== 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="accent" size="md" icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            New Site
          </Button>
        </div>
      </div>

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
        <EmptyState onNew={() => setShowCreate(true)} />
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
    </div>
  );
};