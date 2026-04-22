import type { Template } from '../types';

// These mirror the backend templates.data.ts
// Browsing works offline; "Use Template" still calls the API to save to DB
export const BUILTIN_TEMPLATES: Template[] = [
  {
    id: 'tpl-blank',
    name: 'Blank',
    description: 'Start from a completely empty canvas and build freely.',
    thumbnail: '',
    category: 'blank',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        sections: [],
        meta: { title: 'Home' },
      },
    ],
    meta: { title: 'My Site', description: '', language: 'en' },
  },
  {
    id: 'tpl-portfolio',
    name: 'Portfolio',
    description: 'Clean personal portfolio with Home, About, and Contact pages including a contact form.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    category: 'personal',
    pages: [],
    meta: { title: 'My Portfolio', language: 'en' },
  },
  {
    id: 'tpl-business',
    name: 'Business',
    description: 'Professional business landing page with a hero, services section, and WhatsApp contact button.',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    category: 'business',
    pages: [],
    meta: { title: 'My Business', language: 'en' },
  },
];

export const TEMPLATE_PREVIEWS: Record<string, { bg: string; accent: string; elements: string[] }> = {
  'tpl-blank': {
    bg: '#f9fafb',
    accent: '#6b7280',
    elements: [],
  },
  'tpl-portfolio': {
    bg: '#0f0f0f',
    accent: '#6ee7b7',
    elements: ['Heading', 'Bio Text', 'About Page', 'Contact Form'],
  },
  'tpl-business': {
    bg: '#1e3a5f',
    accent: '#facc15',
    elements: ['Hero Banner', 'Services', 'Contact Form', 'WhatsApp'],
  },
};
