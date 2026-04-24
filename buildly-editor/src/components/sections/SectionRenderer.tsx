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

// Loads a Google Font dynamically if not already loaded
const loadedFonts = new Set<string>();
function useGoogleFont(fontName?: string) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

interface Props {
  section: Section;
  pages?: SitePage[];
  preview?: boolean;
  siteSlug?: string;
}

export const SectionRenderer: React.FC<Props> = ({ section, pages, preview, siteSlug }) => {
  // Load Google Fonts declared for this section
  useGoogleFont(section.styles.headingFont);
  useGoogleFont(section.styles.bodyFont);

  if (section.hidden) return null;

  // Wrap each section with an id for anchor-link scrolling
  const sectionId = section.type; // e.g. "about", "services", "contact"

  const wrapped = (children: React.ReactNode) => (
    <div id={sectionId} data-section={sectionId}>
      {children}
    </div>
  );

  switch (section.type) {
    case 'navbar':
      return wrapped(<NavbarSection section={section} pages={pages} />);
    case 'hero':
      return wrapped(<HeroSection section={section} />);
    case 'about':
      return wrapped(<AboutSection section={section} />);
    case 'services':
      return wrapped(<ServicesSection section={section} />);
    case 'testimonials':
      return wrapped(<TestimonialsSection section={section} />);
    case 'faq':
      return wrapped(<FaqSection section={section} />);
    case 'contact':
      return wrapped(<ContactSection section={section} preview={preview} siteSlug={siteSlug} />);
    case 'footer':
      return wrapped(<FooterSection section={section} pages={pages} />);
    default:
      return null;
  }
};