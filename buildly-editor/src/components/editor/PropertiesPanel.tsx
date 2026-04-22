import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Settings2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSiteStore } from '../../stores/siteStore';
import { SECTION_VARIANTS } from '../../lib/sectionDefaults';
import { ColorPicker } from '../ui';
import type { SectionType } from '../../types';

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(s => !s)} className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-muted hover:text-text-dim uppercase tracking-wider transition-colors">
        {title}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-muted uppercase tracking-wider font-medium">{label}</label>
    {children}
  </div>
);

const TextInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }> = ({ value, onChange, placeholder, multiline }) => (
  multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60 resize-none" />
    : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60" />
);

export const PropertiesPanel: React.FC = () => {
  const {
    selectedSection,
    updateSectionContent, updateSectionStyle, updateSectionItem,
    addSectionItem, removeSectionItem, changeVariant,
  } = useSiteStore();

  const section = selectedSection();

  if (!section) {
    return (
      <aside className="w-64 bg-panel border-l border-border flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Settings2 size={14} className="text-muted" />
          <span className="text-xs font-display font-semibold text-text-dim uppercase tracking-wider">Properties</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3 pb-12">
          <div className="w-10 h-10 rounded-xl border border-dashed border-border flex items-center justify-center">
            <Settings2 size={18} className="text-muted" />
          </div>
          <p className="text-xs text-muted leading-relaxed">Click a section on the canvas to edit it.</p>
        </div>
      </aside>
    );
  }

  const c = section.content;
  const s = section.styles;
  const upC = (k: string, v: string) => updateSectionContent(section.id, k, v);
  const upS = (k: string, v: string) => updateSectionStyle(section.id, k, v);

  // Variant switcher
  const variants = SECTION_VARIANTS[section.type]?.variants || [];

  return (
    <aside className="w-64 bg-panel border-l border-border flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Settings2 size={14} className="text-muted" />
        <span className="text-xs font-display font-semibold text-text-dim uppercase tracking-wider capitalize">{section.type}</span>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Design Variant Switcher */}
        {variants.length > 1 && (
          <Section title="Design Variant">
            <div className="flex flex-col gap-2">
              {variants.map(v => (
                <button key={v.id} onClick={() => changeVariant(section.id, section.type as SectionType, v.id)}
                  className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left', section.variant === v.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:border-zinc-600 hover:text-text-dim')}>
                  <div className={clsx('w-2 h-2 rounded-full', section.variant === v.id ? 'bg-accent' : 'bg-border')} />
                  {v.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Colors */}
        <Section title="Colors">
          <ColorPicker label="Background" value={s.bg} onChange={v => upS('bg', v)} />
          <ColorPicker label="Text" value={s.textColor} onChange={v => upS('textColor', v)} />
          <ColorPicker label="Heading" value={s.headingColor || s.textColor} onChange={v => upS('headingColor', v)} />
          <ColorPicker label="Accent" value={s.accentColor} onChange={v => upS('accentColor', v)} />
          <ColorPicker label="Muted" value={s.mutedColor || '#6b7280'} onChange={v => upS('mutedColor', v)} />
          <ColorPicker label="Card BG" value={s.cardBg || '#f9fafb'} onChange={v => upS('cardBg', v)} />
          <ColorPicker label="Border" value={s.borderColor || '#e5e7eb'} onChange={v => upS('borderColor', v)} />
        </Section>

        {/* NAVBAR content */}
        {section.type === 'navbar' && (
          <Section title="Navigation">
            <Field label="Brand Name"><TextInput value={c.brand || ''} onChange={v => upC('brand', v)} placeholder="MyBrand" /></Field>
            <Field label="CTA Button Text"><TextInput value={c.ctaText || ''} onChange={v => upC('ctaText', v)} placeholder="Get Started" /></Field>
            <Field label="CTA Link"><TextInput value={c.ctaLink || ''} onChange={v => upC('ctaLink', v)} placeholder="#contact" /></Field>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-medium block mb-2">Nav Links</label>
              {(section.navLinks || []).map((link, i) => (
                <div key={i} className="flex gap-1 mb-1.5">
                  <input value={link.label} onChange={e => { const nl = [...(section.navLinks||[])]; nl[i] = {...nl[i], label: e.target.value}; useSiteStore.getState().updateSection(section.id, { navLinks: nl }); }}
                    className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="Label" />
                  <input value={link.href} onChange={e => { const nl = [...(section.navLinks||[])]; nl[i] = {...nl[i], href: e.target.value}; useSiteStore.getState().updateSection(section.id, { navLinks: nl }); }}
                    className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="href" />
                  <button onClick={() => { const nl = (section.navLinks||[]).filter((_, j) => j !== i); useSiteStore.getState().updateSection(section.id, { navLinks: nl }); }}
                    className="text-red-400 hover:text-red-300 px-1"><Trash2 size={11} /></button>
                </div>
              ))}
              <button onClick={() => useSiteStore.getState().updateSection(section.id, { navLinks: [...(section.navLinks||[]), { label: 'Link', href: '#' }] })}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-dim mt-1"><Plus size={11} /> Add link</button>
            </div>
          </Section>
        )}

        {/* HERO content */}
        {section.type === 'hero' && (
          <Section title="Content">
            <Field label="Badge/Tag"><TextInput value={c.badge || ''} onChange={v => upC('badge', v)} placeholder="Welcome" /></Field>
            <Field label="Heading"><TextInput value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
            <Field label="Subheading"><TextInput value={c.subheading || ''} onChange={v => upC('subheading', v)} multiline /></Field>
            <Field label="Button 1 Text"><TextInput value={c.ctaText || ''} onChange={v => upC('ctaText', v)} /></Field>
            <Field label="Button 1 Link"><TextInput value={c.ctaLink || ''} onChange={v => upC('ctaLink', v)} /></Field>
            <Field label="Button 2 Text"><TextInput value={c.cta2Text || ''} onChange={v => upC('cta2Text', v)} /></Field>
            <Field label="Button 2 Link"><TextInput value={c.cta2Link || ''} onChange={v => upC('cta2Link', v)} /></Field>
            <Field label="Image URL"><TextInput value={c.image || ''} onChange={v => upC('image', v)} placeholder="https://..." /></Field>
            {section.variant === 4 && <Field label="Overlay Opacity (0–1)"><TextInput value={c.overlayOpacity || '0.5'} onChange={v => upC('overlayOpacity', v)} /></Field>}
          </Section>
        )}

        {/* ABOUT content */}
        {section.type === 'about' && (
          <Section title="Content">
            <Field label="Badge"><TextInput value={c.badge || ''} onChange={v => upC('badge', v)} /></Field>
            <Field label="Heading"><TextInput value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
            <Field label="Body Text"><TextInput value={c.body || ''} onChange={v => upC('body', v)} multiline /></Field>
            <Field label="Bullet 1"><TextInput value={c.point1 || ''} onChange={v => upC('point1', v)} /></Field>
            <Field label="Bullet 2"><TextInput value={c.point2 || ''} onChange={v => upC('point2', v)} /></Field>
            <Field label="Bullet 3"><TextInput value={c.point3 || ''} onChange={v => upC('point3', v)} /></Field>
            <Field label="CTA Text"><TextInput value={c.ctaText || ''} onChange={v => upC('ctaText', v)} /></Field>
            <Field label="Image URL"><TextInput value={c.image || ''} onChange={v => upC('image', v)} placeholder="https://..." /></Field>
            <Field label="Stat 1 Value"><TextInput value={c.stat1Value || ''} onChange={v => upC('stat1Value', v)} /></Field>
            <Field label="Stat 1 Label"><TextInput value={c.stat1Label || ''} onChange={v => upC('stat1Label', v)} /></Field>
            <Field label="Stat 2 Value"><TextInput value={c.stat2Value || ''} onChange={v => upC('stat2Value', v)} /></Field>
            <Field label="Stat 2 Label"><TextInput value={c.stat2Label || ''} onChange={v => upC('stat2Label', v)} /></Field>
            <Field label="Stat 3 Value"><TextInput value={c.stat3Value || ''} onChange={v => upC('stat3Value', v)} /></Field>
            <Field label="Stat 3 Label"><TextInput value={c.stat3Label || ''} onChange={v => upC('stat3Label', v)} /></Field>
          </Section>
        )}

        {/* SERVICES / TESTIMONIALS / FAQ items */}
        {['services', 'testimonials', 'faq'].includes(section.type) && (
          <>
            <Section title="Heading">
              <Field label="Badge"><TextInput value={c.badge || ''} onChange={v => upC('badge', v)} /></Field>
              <Field label="Heading"><TextInput value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
              <Field label="Subheading"><TextInput value={c.subheading || ''} onChange={v => upC('subheading', v)} multiline /></Field>
            </Section>
            <Section title={section.type === 'faq' ? 'Questions' : section.type === 'testimonials' ? 'Reviews' : 'Services'}>
              {(section.items || []).map((item, i) => (
                <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-text-dim">#{i + 1}</span>
                    <button onClick={() => removeSectionItem(section.id, item.id)} className="text-red-400 hover:text-red-300"><Trash2 size={11} /></button>
                  </div>
                  {section.type === 'services' && <>
                    <TextInput value={item.icon || ''} onChange={v => updateSectionItem(section.id, item.id, { icon: v })} placeholder="Emoji icon" />
                    <TextInput value={item.title || ''} onChange={v => updateSectionItem(section.id, item.id, { title: v })} placeholder="Title" />
                    <TextInput value={item.description || ''} onChange={v => updateSectionItem(section.id, item.id, { description: v })} placeholder="Description" multiline />
                  </>}
                  {section.type === 'testimonials' && <>
                    <TextInput value={item.quote || ''} onChange={v => updateSectionItem(section.id, item.id, { quote: v })} placeholder="Quote" multiline />
                    <TextInput value={item.name || ''} onChange={v => updateSectionItem(section.id, item.id, { name: v })} placeholder="Name" />
                    <TextInput value={item.role || ''} onChange={v => updateSectionItem(section.id, item.id, { role: v })} placeholder="Role, Company" />
                    <TextInput value={item.image || ''} onChange={v => updateSectionItem(section.id, item.id, { image: v })} placeholder="Avatar URL" />
                  </>}
                  {section.type === 'faq' && <>
                    <TextInput value={item.question || ''} onChange={v => updateSectionItem(section.id, item.id, { question: v })} placeholder="Question" />
                    <TextInput value={item.answer || ''} onChange={v => updateSectionItem(section.id, item.id, { answer: v })} placeholder="Answer" multiline />
                  </>}
                </div>
              ))}
              <button onClick={() => addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent hover:text-accent-dim mt-1 font-medium">
                <Plus size={11} /> Add item
              </button>
            </Section>
          </>
        )}

        {/* CONTACT content */}
        {section.type === 'contact' && (
          <Section title="Contact Info">
            <Field label="Badge"><TextInput value={c.badge || ''} onChange={v => upC('badge', v)} /></Field>
            <Field label="Heading"><TextInput value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
            <Field label="Subheading"><TextInput value={c.subheading || ''} onChange={v => upC('subheading', v)} multiline /></Field>
            <Field label="Email"><TextInput value={c.email || ''} onChange={v => upC('email', v)} /></Field>
            <Field label="Phone"><TextInput value={c.phone || ''} onChange={v => upC('phone', v)} /></Field>
            <Field label="Address"><TextInput value={c.address || ''} onChange={v => upC('address', v)} /></Field>
            <Field label="WhatsApp Number"><TextInput value={c.whatsappPhone || ''} onChange={v => upC('whatsappPhone', v)} placeholder="237600000000" /></Field>
            <Field label="WhatsApp Message"><TextInput value={c.whatsappMessage || ''} onChange={v => upC('whatsappMessage', v)} multiline /></Field>
            <Field label="Form Recipient Email"><TextInput value={c.formRecipient || ''} onChange={v => upC('formRecipient', v)} /></Field>
            <Field label="Submit Button Text"><TextInput value={c.submitLabel || ''} onChange={v => upC('submitLabel', v)} /></Field>
            <Field label="Success Message"><TextInput value={c.successMessage || ''} onChange={v => upC('successMessage', v)} /></Field>
          </Section>
        )}

        {/* FOOTER content */}
        {section.type === 'footer' && (
          <>
            <Section title="Brand">
              <Field label="Brand Name"><TextInput value={c.brand || ''} onChange={v => upC('brand', v)} /></Field>
              <Field label="Tagline"><TextInput value={c.tagline || ''} onChange={v => upC('tagline', v)} multiline /></Field>
              <Field label="Email"><TextInput value={c.email || ''} onChange={v => upC('email', v)} /></Field>
              <Field label="Phone"><TextInput value={c.phone || ''} onChange={v => upC('phone', v)} /></Field>
              <Field label="Copyright"><TextInput value={c.copyright || ''} onChange={v => upC('copyright', v)} /></Field>
            </Section>
            <Section title="Link Groups">
              {(section.items || []).map((group, i) => (
                <div key={group.id} className="border border-border rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <input value={group.group || ''} onChange={e => updateSectionItem(section.id, group.id, { group: e.target.value })}
                      className="text-xs font-semibold bg-transparent text-text-dim border-b border-border outline-none w-24" placeholder="Group name" />
                    <button onClick={() => removeSectionItem(section.id, group.id)} className="text-red-400"><Trash2 size={11} /></button>
                  </div>
                  {(group.links || []).map((link, j) => (
                    <div key={j} className="flex gap-1 mb-1">
                      <input value={link.label} onChange={e => { const it = JSON.parse(JSON.stringify(section.items||[])); it[i].links[j].label = e.target.value; useSiteStore.getState().updateSection(section.id, { items: it }); }}
                        className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="Label" />
                      <input value={link.href} onChange={e => { const it = JSON.parse(JSON.stringify(section.items||[])); it[i].links[j].href = e.target.value; useSiteStore.getState().updateSection(section.id, { items: it }); }}
                        className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="href" />
                    </div>
                  ))}
                  <button onClick={() => { const it = JSON.parse(JSON.stringify(section.items||[])); it[i].links = [...(it[i].links||[]), { label: 'Link', href: '#' }]; useSiteStore.getState().updateSection(section.id, { items: it }); }}
                    className="text-xs text-accent mt-1 flex items-center gap-1"><Plus size={10} />Add link</button>
                </div>
              ))}
              <button onClick={() => addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent hover:text-accent-dim mt-1"><Plus size={11} />Add group</button>
            </Section>
          </>
        )}
      </div>
    </aside>
  );
};
