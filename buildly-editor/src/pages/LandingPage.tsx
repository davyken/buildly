import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui';

/* ────────────────────────────────
   Icons
   ──────────────────────────────── */
const LogoIcon = () => (
  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="black" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="black" opacity="0.6" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="black" opacity="0.4" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="black" opacity="0.2" />
    </svg>
  </div>
);

const DragIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const ResponsiveIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const DomainIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const FormsIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
  </svg>
);

const SeoIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SpeedIcon = () => (
  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

/* ────────────────────────────────
   Components
   ──────────────────────────────── */

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-canvas/80 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="font-display font-bold text-xl text-text tracking-tight">Buildly</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-dim">
          <button onClick={() => scrollTo('features')} className="hover:text-text transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-text transition-colors">How it works</button>
          <button onClick={() => scrollTo('templates')} className="hover:text-text transition-colors">Templates</button>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="accent" size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="accent" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 canvas-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Now in public beta
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-text leading-[1.1] tracking-tight text-balance">
            Build websites.<br />
            <span className="text-accent">No code required.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-dim max-w-2xl mx-auto text-balance leading-relaxed">
            Drag, drop, and publish professional websites in minutes. From landing pages to full portfolios — all without touching a single line of code.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Button variant="accent" size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="accent" size="lg">Start building free</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign in to your account</Button>
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-xs text-muted">No credit card required. Free plan includes 1 site.</p>
        </div>

        {/* Editor mockup */}
        <div className="mt-16 lg:mt-24 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-surface shadow-panel overflow-hidden">
            {/* Fake toolbar */}
            <div className="h-10 border-b border-border bg-panel flex items-center px-4 gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="h-5 w-px bg-border" />
              <div className="h-4 w-24 rounded bg-border" />
              <div className="flex-1" />
              <div className="h-4 w-16 rounded bg-accent/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_260px] min-h-[320px]">
              {/* Fake sidebar */}
              <div className="hidden md:flex flex-col gap-3 p-4 border-r border-border">
                <div className="h-3 w-20 rounded bg-border" />
                <div className="h-20 rounded-lg bg-border/40" />
                <div className="h-20 rounded-lg bg-border/40" />
                <div className="h-20 rounded-lg bg-border/40" />
              </div>
              {/* Fake canvas */}
              <div className="flex flex-col gap-4 p-6">
                <div className="h-32 rounded-lg bg-border/30" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-lg bg-border/30" />
                  <div className="h-24 rounded-lg bg-border/30" />
                  <div className="h-24 rounded-lg bg-border/30" />
                </div>
                <div className="h-24 rounded-lg bg-border/30" />
              </div>
              {/* Fake properties */}
              <div className="hidden md:flex flex-col gap-3 p-4 border-l border-border">
                <div className="h-3 w-24 rounded bg-border" />
                <div className="h-8 rounded bg-border/40" />
                <div className="h-8 rounded bg-border/40" />
                <div className="h-24 rounded bg-border/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features: React.FC = () => {
  const feats = [
    { icon: <DragIcon />, title: 'Drag & Drop', desc: 'Intuitive visual editor that lets you build pages by dragging elements exactly where you want them.' },
    { icon: <ResponsiveIcon />, title: 'Responsive', desc: 'Every template is fully responsive by default. Your site looks great on desktop, tablet, and mobile.' },
    { icon: <DomainIcon />, title: 'Custom Domains', desc: 'Connect your own domain or use our free buildly.site subdomain to go live instantly.' },
    { icon: <FormsIcon />, title: 'Contact Forms', desc: 'Collect leads and messages with built-in form blocks. Submissions are organized and easy to manage.' },
    { icon: <SeoIcon />, title: 'SEO Ready', desc: 'Edit meta titles, descriptions, and Open Graph tags to make sure your site gets discovered.' },
    { icon: <SpeedIcon />, title: 'Fast Hosting', desc: 'Static sites served from a global CDN. Lightning-fast load times, everywhere in the world.' },
  ];

  return (
    <section id="features" className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">Everything you need</h2>
          <p className="mt-4 text-text-dim text-lg">A complete toolkit for building and publishing modern websites without the complexity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feats.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-colors">
              <div className="mb-4 p-2.5 rounded-xl bg-accent/10 w-fit">{f.icon}</div>
              <h3 className="font-display font-semibold text-text text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-text-dim leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    { num: '01', title: 'Choose a template', desc: 'Start from one of our professionally designed templates or build from scratch with a blank canvas.' },
    { num: '02', title: 'Customize everything', desc: 'Edit text, images, colors, and layouts with our visual editor. Make it truly yours.' },
    { num: '03', title: 'Publish in one click', desc: 'Hit publish and your site is live. Connect a custom domain or share your buildly.site link.' },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">How it works</h2>
          <p className="mt-4 text-text-dim text-lg">From idea to live website in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex flex-col items-start p-6 rounded-2xl bg-surface border border-border">
              <span className="text-4xl font-display font-bold text-accent/20">{s.num}</span>
              <h3 className="mt-4 font-display font-semibold text-text text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-text-dim leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TemplatesTeaser: React.FC = () => {
  const cards = [
    { title: 'Portfolio', desc: 'Showcase your work with elegant galleries.', className: 'from-emerald-500/20 to-emerald-900/20' },
    { title: 'SaaS Landing', desc: 'Convert visitors with crisp product pages.', className: 'from-indigo-500/20 to-indigo-900/20' },
    { title: 'Agency', desc: 'Professional presence for creative teams.', className: 'from-amber-500/20 to-amber-900/20' },
    { title: 'Personal', desc: 'A clean, minimal home on the web.', className: 'from-rose-500/20 to-rose-900/20' },
  ];

  return (
    <section id="templates" className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">Start with a template</h2>
            <p className="mt-2 text-text-dim text-lg">Professionally designed starting points for any project.</p>
          </div>
          <Link to="/register" className="shrink-0">
            <Button variant="outline" size="md">Browse all templates</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-accent/30 transition-colors cursor-pointer">
              <div className={`h-40 bg-gradient-to-br ${c.className} opacity-60 group-hover:opacity-80 transition-opacity`} />
              <div className="p-5">
                <h3 className="font-display font-semibold text-text">{c.title}</h3>
                <p className="mt-1 text-sm text-text-dim">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingTeaser: React.FC = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-4xl mx-auto px-6">
        <div className="rounded-2xl border border-border bg-surface p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-bold text-text">Free to start.</h2>
            <p className="mt-3 text-text-dim text-lg">No credit card required. Get 1 site, unlimited pages, and core features on the free plan.</p>
            <ul className="mt-6 space-y-3">
              {['1 published site', 'Unlimited pages', 'Custom domain support', 'Built-in contact forms', 'SSL included'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-text-dim">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <span className="font-display text-5xl font-bold text-text">$0</span>
            <span className="text-sm text-muted">/month starter plan</span>
            <Link to="/register" className="mt-2">
              <Button variant="accent" size="lg">Get started free</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => (
  <footer className="border-t border-border py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <LogoIcon />
        <span className="font-display font-bold text-lg text-text tracking-tight">Buildly</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted">
        <span>© {new Date().getFullYear()} Buildly</span>
        <Link to="/login" className="hover:text-text transition-colors">Sign in</Link>
        <Link to="/register" className="hover:text-text transition-colors">Get started</Link>
      </div>
    </div>
  </footer>
);

/* ────────────────────────────────
   Page
   ──────────────────────────────── */

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-text font-body selection:bg-accent/25">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <TemplatesTeaser />
      <PricingTeaser />
      <Footer />
    </div>
  );
};

