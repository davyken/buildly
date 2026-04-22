import React from 'react';
import type { Section, SitePage } from '../../types';
import { NavbarSection } from './NavbarSection';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { ServicesSection } from './ServicesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';
import { FooterSection } from './FooterSection';

interface Props {
  section: Section;
  pages?: SitePage[];
  preview?: boolean;
  siteSlug?: string;
}

export const SectionRenderer: React.FC<Props> = ({ section, pages, preview, siteSlug }) => {
  if (section.hidden) return null;
  switch (section.type) {
    case 'navbar': return <NavbarSection section={section} pages={pages} />;
    case 'hero': return <HeroSection section={section} />;
    case 'about': return <AboutSection section={section} />;
    case 'services': return <ServicesSection section={section} />;
    case 'testimonials': return <TestimonialsSection section={section} />;
    case 'faq': return <FaqSection section={section} />;
    case 'contact': return <ContactSection section={section} preview={preview} siteSlug={siteSlug} />;
    case 'footer': return <FooterSection section={section} pages={pages} />;
    default: return null;
  }
};
