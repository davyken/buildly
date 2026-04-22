export type SectionType =
  | 'navbar' | 'hero' | 'about' | 'services'
  | 'testimonials' | 'faq' | 'contact' | 'footer';

export interface SectionItem {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
  name?: string;
  role?: string;
  quote?: string;
  question?: string;
  answer?: string;
  label?: string;
  href?: string;
  group?: string;
  links?: { label: string; href: string }[];
}

export interface SectionStyles {
  bg: string;
  textColor: string;
  accentColor: string;
  headingColor?: string;
  mutedColor?: string;
  cardBg?: string;
  borderColor?: string;
  overlayOpacity?: string;
  backgroundImage?: string;
  backgroundOverlay?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  // Font families
  headingFont?: string;
  bodyFont?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  variant: number;
  content: Record<string, string>;
  items?: SectionItem[];
  navLinks?: { label: string; href: string; pageId?: string }[];
  styles: SectionStyles;
  hidden?: boolean;
}

export interface SitePage {
  id: string;
  name: string;
  path: string;
  sections: Section[];
  meta?: { title?: string; description?: string };
}

export interface SiteMeta {
  title: string;
  description?: string;
  favicon?: string;
  language?: string;
}

export type SiteStatus = 'draft' | 'published';

export interface Site {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  status: SiteStatus;
  customDomain?: string;
  meta: SiteMeta;
  pages: SitePage[];
  globalBackground: string;
  viewCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  limits?: { maxSites: number; customDomains: number };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  pages: SitePage[];
  meta: SiteMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}