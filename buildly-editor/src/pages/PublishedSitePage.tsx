import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { SectionRenderer } from '../components/sections/SectionRenderer';
import { Spinner } from '../components/ui';
import type { Site } from '../types';

// Fetches site by slug (public endpoint — no auth needed)
const fetchPublicSite = async (slug: string): Promise<Site> => {
  const res = await api.get(`/sites/public/${slug}`);
  return res.data.data;
};

export const PublishedSitePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const pagePath = '/' + (params.get('page') || '').replace(/^\//, '');

  const { data: site, isLoading, error } = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => fetchPublicSite(slug!),
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
  });

  // Find the correct page to render
  const currentPage = site?.pages.find(p => p.path === pagePath) ?? site?.pages[0];

  // Set page title
  useEffect(() => {
    if (currentPage?.meta?.title) {
      document.title = `${currentPage.meta.title} — ${site?.meta?.title || site?.name || ''}`;
    } else if (site?.meta?.title) {
      document.title = site.meta.title;
    }
  }, [currentPage, site]);

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      const href = target.closest('a')?.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="text-gray-400" />
          <p className="text-sm text-gray-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Site Not Found</h1>
          <p className="text-gray-500 text-sm">This site doesn't exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#ffffff', minHeight: '100vh' }}>
        {currentPage.sections.map(section => (
          <SectionRenderer
            key={section.id}
            section={section}
            pages={site.pages}
            preview={false}
            siteSlug={site.slug}
          />
        ))}

        {/* Powered by Buildly badge */}
        <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#0f172a',
              color: '#6ee7b7',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600',
              textDecoration: 'none',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ fontSize: '10px' }}>▣</span>
            Built with Buildly
          </a>
        </div>
      </div>
    </>
  );
};
