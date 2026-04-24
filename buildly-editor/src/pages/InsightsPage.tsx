import React from 'react';
import { sitesApi } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import {
  BarChart3,
  Layout,
  SquarePen,
  Link,
  FileText,
  User,
} from 'lucide-react';

interface Stats {
  total: number;
  published: number;
  draft: number;
  // Add more stats as needed
  views: number;
  visitors: number;
}

export const InsightsPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['insights'],
    queryFn: async () => {
      // In a real app, we would have an analytics endpoint
      // For now, we'll mock some data based on sites
      const sites = await sitesApi.list().then((res) => res.data.data);
      const total = sites.length;
      const published = sites.filter((s) => s.status === 'published').length;
      const draft = sites.filter((s) => s.status === 'draft').length;
      // Mock additional stats
      const views = published * 150; // Example
      const visitors = published * 75; // Example
      return { total, published, draft, views, visitors };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl animate-pulse h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Layout size={24} className="text-accent" />
              <h3 className="text-text font-medium">Total Sites</h3>
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-text">
            {stats?.total}
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Link size={24} className="text-accent" />
              <h3 className="text-text font-medium">Published Sites</h3>
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-text">
            {stats?.published}
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-accent" />
              <h3 className="text-text font-medium">Draft Sites</h3>
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-text">
            {stats?.draft}
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <User size={24} className="text-accent" />
              <h3 className="text-text font-medium">Views (Published)</h3>
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-text">
            {stats?.views}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Placeholder for now */}
      <div className="grid gap-6">
        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <h3 className="text-text font-medium">Site Activity Over Time</h3>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-panel rounded-xl animate-pulse" />
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border">
          <CardHeader className="pb-4">
            <h3 className="text-text font-medium">Top Performing Sites</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-panel rounded" />
                  <div className="flex-1">
                    <h4 className="text-text font-medium">Site Name {i + 1}</h4>
                    <p className="text-muted text-sm">1,234 views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};