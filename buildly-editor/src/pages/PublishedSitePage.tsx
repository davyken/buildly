import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { SectionRenderer } from '../components/sections/SectionRenderer';
import { Spinner } from '../components/ui';
import type { Site, SitePage } from '../types';

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

  // Find the right page to show
  const currentPage: SitePage | undefined =
    site?.pages.find(p => p.path === pagePath) ?? site?.pages[0];

  // Page title
  useEffect(() => {
    if (!site) return;
    const title = currentPage?.meta?.title || site.meta?.title || site.name;
    document.title = title;
  }, [currentPage, site]);

  // Smooth scroll for #anchor links AND handle /page navigation within the site
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Anchor scroll: #section
      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Internal page: /about, /services etc — handled by browser navigation
      // (works because published sites all use the same /s/:slug route and React Router)
    };

    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, []);

  // Scroll to top when page changes
  useEffect(() => { window.scrollTo(0, 0); }, [pagePath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size={32} className="text-gray-400" />
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

  // Collect all Google Font families used across this page's sections
  const fonts = new Set<string>();
  currentPage.sections.forEach(s => {
    if (s.styles.headingFont) fonts.add(s.styles.headingFont);
    if (s.styles.bodyFont) fonts.add(s.styles.bodyFont);
  });
  const fontQuery = Array.from(fonts).map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`).join('&');

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href={`https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600${fontQuery ? '&' + fontQuery : ''}&display=swap`} rel="stylesheet" />

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

         {/* DNS Record Info */}
        {site.customDomain && site.pages?.length > 0 && (
          <div className="mb-4 mx-4 mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">DNS Configuration</p>
            <p className="text-[11px] text-gray-300 mb-2">To use your custom domain, add this CNAME record at your domain registrar:</p>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-black/30 text-amber-100">{site.customDomain}</span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 rounded bg-black/30 text-amber-100">sites.{window.location.hostname === 'localhost' ? 'yourapp.io' : window.location.hostname.replace(/^www\./, '').replace(/^render\./, '')}</span>
            </div>
            <p className="text-[10px] text-gray-500/60 mt-2">DNS changes can take up to 24 hours to propagate.</p>
          </div>
        )}

        {/* Buildly badge */}
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'#0f172a', color:'#6ee7b7', borderRadius:999, fontSize:11, fontWeight:600, textDecoration:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.3)', letterSpacing:'0.01em' }}>
            <span style={{ fontSize:10 }}>▣</span> Built with Buildly
          </a>
        </div>
      </div>
    </>
  );
};