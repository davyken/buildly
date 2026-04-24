import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Globe, Plus, Copy, Trash2, ExternalLink, Clock, Layers
} from 'lucide-react';
import { sitesApi } from '../lib/api';
import { Button, Badge, Modal, Input } from '../components/ui';
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
      <iframe 
        src={`${import.meta.env.VITE_RENDERER_URL || 'http://localhost:3001'}/s/${site.slug}`}
        className="w-full h-full border-0 rounded-t-2xl pointer-events-none"
        title={site.name}
      />
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="green">● Live</Badge>
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
          <Button variant="ghost" size="xs" icon={<ExternalLink size={13} />}
            onClick={() => window.open(`${import.meta.env.VITE_RENDERER_URL || 'http://localhost:3001'}/s/${site.slug}`, '_blank')}
            title="View live site"
          />
          <Button variant="danger" size="xs" icon={<Trash2 size={13} />} onClick={onDelete} title="Delete" />
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full mt-3" onClick={onEdit}>
        Open Editor →
      </Button>
    </div>
  </div>
);

const EmptyState: React.FC<{ onNew: () => void }> = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
      <Globe size={28} className="text-muted" />
    </div>
    <h3 className="font-display text-xl font-semibold text-text mb-2">No published sites yet</h3>
    <p className="text-text-dim text-sm max-w-xs mb-8">
      Publish a site to see it here.
    </p>
    <Button variant="accent" size="md" icon={<Plus size={15} />} onClick={onNew}>
      Create a Site
    </Button>
  </div>
);

export const PublishedSitesPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [siteName, setSiteName] = useState('');

  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['published-sites'],
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

  const sites: Site[] = (sitesData || []).filter(site => site.status === 'published');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Published Sites
          </h1>
          <p className="text-text-dim mt-1">
            {sites.length === 0
              ? 'No published sites yet. Create and publish a site to see it here.'
              : `${sites.length} published site${sites.length !== 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md" icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
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