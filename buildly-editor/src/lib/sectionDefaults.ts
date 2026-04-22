import { v4 as uuidv4 } from 'uuid';
import type { Section, SectionType } from '../types';

// ── Palette helpers ───────────────────────────────────────────────────────────
const lightStyle = { bg: '#ffffff', textColor: '#111827', accentColor: '#111827', headingColor: '#111827', mutedColor: '#6b7280', cardBg: '#f9fafb', borderColor: '#e5e7eb' };
const darkStyle = { bg: '#0f172a', textColor: '#f1f5f9', accentColor: '#6ee7b7', headingColor: '#ffffff', mutedColor: '#94a3b8', cardBg: '#1e293b', borderColor: '#334155' };
const slateStyle = { bg: '#f8fafc', textColor: '#1e293b', accentColor: '#6366f1', headingColor: '#0f172a', mutedColor: '#64748b', cardBg: '#ffffff', borderColor: '#e2e8f0' };

function makeId() { return uuidv4().slice(0, 8); }

// ── Section definitions per type and variant ──────────────────────────────────
export const SECTION_VARIANTS: Record<SectionType, { label: string; variants: { id: number; label: string; thumb: string; default: () => Omit<Section, 'id'> }[] }> = {

  // ── NAVBAR ──────────────────────────────────────────────────────────────────
  navbar: {
    label: 'Navigation',
    variants: [
      {
        id: 1, label: 'Light Minimal', thumb: 'nav-light',
        default: () => ({
          type: 'navbar', variant: 1,
          content: { brand: 'MyBrand', ctaText: 'Get Started', ctaLink: '#contact' },
          navLinks: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '#about' },
            { label: 'Services', href: '#services' },
            { label: 'Contact', href: '#contact' },
          ],
          styles: { ...lightStyle },
        }),
      },
      {
        id: 2, label: 'Dark Bold', thumb: 'nav-dark',
        default: () => ({
          type: 'navbar', variant: 2,
          content: { brand: 'MyBrand', ctaText: 'Get Started', ctaLink: '#contact' },
          navLinks: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '#about' },
            { label: 'Services', href: '#services' },
            { label: 'Contact', href: '#contact' },
          ],
          styles: { ...darkStyle },
        }),
      },
      {
        id: 3, label: 'Centered Logo', thumb: 'nav-center',
        default: () => ({
          type: 'navbar', variant: 3,
          content: { brand: 'MyBrand', ctaText: 'Contact', ctaLink: '#contact' },
          navLinks: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '#about' },
            { label: 'Services', href: '#services' },
            { label: 'Contact', href: '#contact' },
          ],
          styles: { ...slateStyle },
        }),
      },
    ],
  },

  // ── HERO ────────────────────────────────────────────────────────────────────
  hero: {
    label: 'Hero Section',
    variants: [
      {
        id: 1, label: 'Centered Light', thumb: 'hero-light',
        default: () => ({
          type: 'hero', variant: 1,
          content: {
            badge: '✦ Welcome',
            heading: 'Build Your Dream Website Today',
            subheading: 'Create stunning, professional websites without writing a single line of code. Drag, drop, and publish in minutes.',
            ctaText: 'Get Started Free', ctaLink: '#contact',
            cta2Text: 'See Examples', cta2Link: '#services',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80',
          },
          styles: { ...lightStyle },
        }),
      },
      {
        id: 2, label: 'Split Image', thumb: 'hero-split',
        default: () => ({
          type: 'hero', variant: 2,
          content: {
            badge: 'NEW ARRIVAL',
            heading: 'Design That Speaks for Itself',
            subheading: 'Premium quality. Unmatched performance. Built for those who demand the best from their digital presence.',
            ctaText: 'Start Building', ctaLink: '#contact',
            cta2Text: 'Learn More', cta2Link: '#about',
            image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=900&q=80',
          },
          styles: { ...lightStyle },
        }),
      },
      {
        id: 3, label: 'Dark Cinematic', thumb: 'hero-dark',
        default: () => ({
          type: 'hero', variant: 3,
          content: {
            badge: 'NEXT LEVEL',
            heading: 'Where Vision Meets Reality',
            subheading: 'We transform your ideas into powerful digital experiences that captivate and convert.',
            ctaText: 'Explore Our Work', ctaLink: '#services',
            cta2Text: '', cta2Link: '',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
          },
          styles: { ...darkStyle, accentColor: '#6ee7b7' },
        }),
      },
      {
        id: 4, label: 'BG Image + Overlay', thumb: 'hero-bg',
        default: () => ({
          type: 'hero', variant: 4,
          content: {
            badge: '',
            heading: 'Creating Extraordinary Experiences',
            subheading: 'From concept to launch, we bring your vision to life with precision and creativity.',
            ctaText: 'Work With Us', ctaLink: '#contact',
            cta2Text: 'Our Services', cta2Link: '#services',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
            overlayOpacity: '0.55',
          },
          styles: { bg: '#000000', textColor: '#ffffff', accentColor: '#f59e0b', headingColor: '#ffffff', mutedColor: '#d1d5db' },
        }),
      },
    ],
  },

  // ── ABOUT ───────────────────────────────────────────────────────────────────
  about: {
    label: 'About Us',
    variants: [
      {
        id: 1, label: 'Text + Image', thumb: 'about-split',
        default: () => ({
          type: 'about', variant: 1,
          content: {
            badge: 'About Us',
            heading: 'We Are Passionate About What We Do',
            body: 'Founded in 2018, we have been at the forefront of digital innovation, helping businesses of all sizes establish a powerful online presence. Our team of experts combines creativity with technical excellence to deliver results that exceed expectations.',
            point1: '✓ Over 500 successful projects delivered',
            point2: '✓ Award-winning design team',
            point3: '✓ 24/7 dedicated customer support',
            ctaText: 'Learn More', ctaLink: '#services',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
            stat1Value: '500+', stat1Label: 'Projects Done',
            stat2Value: '98%', stat2Label: 'Happy Clients',
            stat3Value: '12+', stat3Label: 'Years Experience',
          },
          styles: { ...lightStyle },
        }),
      },
      {
        id: 2, label: 'Dark + Stats', thumb: 'about-dark',
        default: () => ({
          type: 'about', variant: 2,
          content: {
            badge: 'Who We Are',
            heading: 'Building Tomorrow\'s Digital Experiences',
            body: 'We are a team of designers, developers, and strategists united by a single mission: to help your brand stand out in the digital age. Every project we take on is treated with the same level of care and dedication as if it were our own.',
            image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
            stat1Value: '10K+', stat1Label: 'Happy Clients',
            stat2Value: '$2M+', stat2Label: 'Revenue Generated',
            stat3Value: '150+', stat3Label: 'Team Members',
            stat4Value: '99.9%', stat4Label: 'Uptime',
          },
          styles: { ...darkStyle },
        }),
      },
    ],
  },

  // ── SERVICES ────────────────────────────────────────────────────────────────
  services: {
    label: 'Services',
    variants: [
      {
        id: 1, label: 'Icon Cards', thumb: 'services-cards',
        default: () => ({
          type: 'services', variant: 1,
          content: {
            badge: 'What We Offer',
            heading: 'Services Built for Success',
            subheading: 'From strategy to execution, we provide end-to-end solutions that drive growth and deliver measurable results for your business.',
          },
          items: [
            { id: makeId(), icon: '🎨', title: 'Brand Design', description: 'Craft a compelling visual identity that resonates with your audience and sets you apart from competition.' },
            { id: makeId(), icon: '⚡', title: 'Web Development', description: 'Fast, secure, and scalable websites built with modern technologies and best practices.' },
            { id: makeId(), icon: '📈', title: 'Digital Marketing', description: 'Data-driven marketing strategies that grow your audience and convert visitors into loyal customers.' },
            { id: makeId(), icon: '📱', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver seamless user experiences.' },
            { id: makeId(), icon: '☁️', title: 'Cloud Solutions', description: 'Enterprise-grade cloud infrastructure that scales with your business needs.' },
            { id: makeId(), icon: '🛡️', title: 'Security & SEO', description: 'Protect your digital assets and rank higher in search results with our proven approaches.' },
          ],
          styles: { ...slateStyle },
        }),
      },
      {
        id: 2, label: 'Dark Feature List', thumb: 'services-list',
        default: () => ({
          type: 'services', variant: 2,
          content: {
            badge: 'Our Services',
            heading: 'Everything You Need to Succeed Online',
            subheading: 'We handle the technical complexity so you can focus on what matters most — growing your business.',
          },
          items: [
            { id: makeId(), icon: '🚀', title: 'Launch Fast', description: 'Get your website live in days, not months. Our streamlined process ensures rapid delivery without sacrificing quality.' },
            { id: makeId(), icon: '🎯', title: 'Targeted Strategy', description: 'We research your market and competition to build a strategy that puts you exactly where your customers are.' },
            { id: makeId(), icon: '💎', title: 'Premium Quality', description: 'Every pixel, every line of code, every word is crafted with meticulous attention to detail and quality standards.' },
            { id: makeId(), icon: '🔄', title: 'Ongoing Support', description: 'Our relationship doesn\'t end at launch. We provide continuous support and improvements to keep you ahead.' },
          ],
          styles: { ...darkStyle },
        }),
      },
    ],
  },

  // ── TESTIMONIALS ─────────────────────────────────────────────────────────────
  testimonials: {
    label: 'Testimonials',
    variants: [
      {
        id: 1, label: 'Card Grid', thumb: 'testimonials-cards',
        default: () => ({
          type: 'testimonials', variant: 1,
          content: { badge: 'Client Reviews', heading: 'What Our Clients Say About Us', subheading: 'Don\'t just take our word for it. Here\'s what real clients have to say about working with us.' },
          items: [
            { id: makeId(), name: 'Sarah Johnson', role: 'CEO, TechStart', quote: 'Working with this team was an absolute game-changer. They delivered beyond our expectations and the results speak for themselves. Our traffic increased by 300% in just 3 months.', image: 'https://i.pravatar.cc/80?img=47' },
            { id: makeId(), name: 'Marcus Chen', role: 'Founder, GrowthLabs', quote: 'The attention to detail and creativity they bring to every project is unmatched. They truly understand what it takes to build a brand that stands out in a crowded market.', image: 'https://i.pravatar.cc/80?img=12' },
            { id: makeId(), name: 'Amara Diallo', role: 'Director, NovaCorp', quote: 'Professional, responsive, and incredibly talented. They took our vague idea and turned it into a stunning website that perfectly captures our brand essence. Highly recommended!', image: 'https://i.pravatar.cc/80?img=45' },
          ],
          styles: { ...lightStyle },
        }),
      },
      {
        id: 2, label: 'Dark Featured Quote', thumb: 'testimonials-featured',
        default: () => ({
          type: 'testimonials', variant: 2,
          content: { badge: 'Testimonial', heading: 'Trusted by Industry Leaders' },
          items: [
            { id: makeId(), name: 'David Okonkwo', role: 'CTO, FutureTech Inc.', quote: 'This is hands-down the best investment we have made this year. The ROI has been incredible — within 6 months of launching our new website, we saw a 4x increase in qualified leads and a 60% improvement in conversion rate. I cannot recommend this team enough.', image: 'https://i.pravatar.cc/120?img=33' },
          ],
          styles: { ...darkStyle },
        }),
      },
    ],
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  faq: {
    label: 'FAQ',
    variants: [
      {
        id: 1, label: 'Clean Accordion', thumb: 'faq-accordion',
        default: () => ({
          type: 'faq', variant: 1,
          content: { badge: 'FAQ', heading: 'Frequently Asked Questions', subheading: 'Everything you need to know about our services. Can\'t find the answer you\'re looking for? Feel free to contact us.' },
          items: [
            { id: makeId(), question: 'How long does it take to build a website?', answer: 'Most projects are completed within 2–4 weeks depending on complexity. Simple landing pages can be ready in as little as 5 business days. We\'ll give you a precise timeline after our initial consultation.' },
            { id: makeId(), question: 'What is included in your web design packages?', answer: 'All packages include custom design, responsive development, SEO optimization, contact forms, Google Analytics integration, and 30 days of post-launch support. Premium packages also include e-commerce, blog setup, and monthly maintenance.' },
            { id: makeId(), question: 'Do I need technical knowledge to manage my website?', answer: 'Not at all! We build user-friendly content management systems so you can easily update text, images, and content without any technical knowledge. We also provide training and documentation.' },
            { id: makeId(), question: 'What happens after my website is launched?', answer: 'We provide 30 days of free support after launch to fix any bugs and make minor adjustments. After that, we offer affordable maintenance packages to keep your site secure, updated, and performing well.' },
            { id: makeId(), question: 'Can you redesign my existing website?', answer: 'Absolutely! We offer complete website redesigns that modernize your look, improve user experience, and boost performance — all while preserving your existing content and SEO rankings.' },
          ],
          styles: { ...slateStyle },
        }),
      },
      {
        id: 2, label: 'Dark Two-Column', thumb: 'faq-twocol',
        default: () => ({
          type: 'faq', variant: 2,
          content: { badge: 'Questions & Answers', heading: 'Got Questions? We\'ve Got Answers.' },
          items: [
            { id: makeId(), question: 'How much does a website cost?', answer: 'Pricing varies based on your requirements. Simple sites start at $500, while complex platforms can range up to $10,000+. We always provide a detailed quote upfront with no hidden fees.' },
            { id: makeId(), question: 'Do you offer ongoing support?', answer: 'Yes! We offer monthly retainer packages starting at $99/month that include hosting, updates, security monitoring, and priority support.' },
            { id: makeId(), question: 'Will my website be mobile-friendly?', answer: 'Every website we build is fully responsive and tested across all devices and browsers. Mobile optimization is a standard part of every project.' },
            { id: makeId(), question: 'Can you help with content and copywriting?', answer: 'Yes, we offer professional copywriting services. Our content team will craft compelling, SEO-optimized copy that speaks to your target audience and drives conversions.' },
          ],
          styles: { ...darkStyle },
        }),
      },
    ],
  },

  // ── CONTACT ──────────────────────────────────────────────────────────────────
  contact: {
    label: 'Contact',
    variants: [
      {
        id: 1, label: 'Split + Form', thumb: 'contact-split',
        default: () => ({
          type: 'contact', variant: 1,
          content: {
            badge: 'Contact Us',
            heading: 'Let\'s Start a Conversation',
            subheading: 'Ready to take your business to the next level? Fill out the form or reach out directly — we\'d love to hear from you.',
            email: 'hello@yourbrand.com',
            phone: '+237 600 000 000',
            address: 'Yaoundé, Cameroon',
            whatsappPhone: '237600000000',
            whatsappMessage: 'Hello! I found your website and I\'d like to discuss a project.',
            formRecipient: 'hello@yourbrand.com',
            submitLabel: 'Send Message',
            successMessage: 'Thank you! We\'ll get back to you within 24 hours.',
          },
          styles: { ...lightStyle },
        }),
      },
      {
        id: 2, label: 'Centered + WhatsApp', thumb: 'contact-centered',
        default: () => ({
          type: 'contact', variant: 2,
          content: {
            badge: 'Get In Touch',
            heading: 'We\'d Love to Hear From You',
            subheading: 'Whether you have a project in mind or just want to say hello, drop us a message. We typically respond within a few hours.',
            email: 'hello@yourbrand.com',
            phone: '+237 600 000 000',
            whatsappPhone: '237600000000',
            whatsappMessage: 'Hi! I\'d like to learn more about your services.',
            formRecipient: 'hello@yourbrand.com',
            submitLabel: 'Send Message',
            successMessage: 'Message sent! We\'ll be in touch soon.',
          },
          styles: { ...darkStyle },
        }),
      },
    ],
  },

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  footer: {
    label: 'Footer',
    variants: [
      {
        id: 1, label: 'Multi-Column Dark', thumb: 'footer-full',
        default: () => ({
          type: 'footer', variant: 1,
          content: {
            brand: 'MyBrand',
            tagline: 'Building exceptional digital experiences that drive growth.',
            email: 'hello@yourbrand.com',
            phone: '+237 600 000 000',
            copyright: `© ${new Date().getFullYear()} MyBrand. All rights reserved.`,
          },
          items: [
            { id: makeId(), group: 'Company', links: [{ label: 'About Us', href: '#about' }, { label: 'Services', href: '#services' }, { label: 'Portfolio', href: '#' }, { label: 'Careers', href: '#' }] },
            { id: makeId(), group: 'Support', links: [{ label: 'FAQ', href: '#faq' }, { label: 'Contact', href: '#contact' }, { label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
          ],
          styles: { bg: '#0f172a', textColor: '#94a3b8', accentColor: '#6ee7b7', headingColor: '#f1f5f9', borderColor: '#1e293b' },
        }),
      },
      {
        id: 2, label: 'Simple Centered', thumb: 'footer-simple',
        default: () => ({
          type: 'footer', variant: 2,
          content: {
            brand: 'MyBrand',
            tagline: 'Made with ♥ for the web.',
            copyright: `© ${new Date().getFullYear()} MyBrand`,
            email: 'hello@yourbrand.com',
          },
          items: [],
          styles: { bg: '#111827', textColor: '#9ca3af', accentColor: '#6ee7b7', headingColor: '#ffffff', borderColor: '#1f2937' },
        }),
      },
    ],
  },
};

// ── Helper to create a new section instance ───────────────────────────────────
export function createSection(type: SectionType, variantId: number): Section {
  const group = SECTION_VARIANTS[type];
  const variantDef = group.variants.find((v) => v.id === variantId) ?? group.variants[0];
  return { id: uuidv4(), ...variantDef.default() };
}
