import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sitesApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { 
  Layers, Globe, FileText, Plus, ArrowUpRight, 
  BarChart3, Zap, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.list().then((r) => r.data.data),
  });

  const stats = {
    total: sites.length,
    published: sites.filter((s: any) => s.status === 'published').length,
    drafts: sites.filter((s: any) => s.status !== 'published').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold text-text">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-dim mt-2 text-lg">
            Here's what's happening with your websites today.
          </p>
        </div>
        <Button variant="accent" size="md" icon={<Plus size={18} />} onClick={() => navigate('/dashboard/templates')}>
          Create New Site
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-surface border border-border hover:border-accent/30 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Layers size={24} />
              </div>
              <Badge variant="default">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-text mb-1">{stats.total}</div>
            <p className="text-sm text-text-dim">Websites created</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border hover:border-accent/30 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <Globe size={24} />
              </div>
              <Badge variant="green">Live</Badge>
            </div>
            <div className="text-3xl font-bold text-text mb-1">{stats.published}</div>
            <p className="text-sm text-text-dim">Published & online</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border hover:border-accent/30 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <FileText size={24} />
              </div>
              <Badge variant="default">Draft</Badge>
            </div>
            <div className="text-3xl font-bold text-text mb-1">{stats.drafts}</div>
            <p className="text-sm text-text-dim">Work in progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-surface border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-accent" />
              Recent Projects
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-accent" onClick={() => navigate('/dashboard/drafts')}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-panel rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sites.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-dim text-sm">No projects yet. Start building!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sites.slice(0, 4).map((site: any) => (
                  <div 
                    key={site._id}
                    onClick={() => navigate(`/editor/${site._id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center">
                        <Layers size={18} className="text-muted" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text">{site.name}</h4>
                        <p className="text-xs text-text-dim">Updated 2 days ago</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-muted" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Card / Tip */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text mb-1">Upgrade to Pro</h3>
                  <p className="text-sm text-text-dim mb-4 leading-relaxed">
                    Get unlimited websites, custom domains, and remove the Buildly branding from your published sites.
                  </p>
                  <Button variant="accent" size="sm">Explore Pro Features</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-accent" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-panel/50 border border-border">
                <p className="text-sm text-text-dim leading-relaxed italic">
                  "Sites with a clear call-to-action on the hero section have 40% higher conversion rates."
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-accent">
                  Learn more design tips →
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'green' }> = ({ children, variant = 'default' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    variant === 'green' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/10 text-muted border border-white/10'
  }`}>
    {children}
  </span>
);