import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Settings2, Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useSiteStore } from '../../stores/siteStore';
import { SECTION_VARIANTS } from '../../lib/sectionDefaults';
import { ColorPicker } from '../ui';
import type { SectionType } from '../../types';

const GOOGLE_FONTS = [
  { label: 'Syne (Default Display)', value: 'Syne' },
  { label: 'DM Sans (Default Body)', value: 'DM Sans' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Lora', value: 'Lora' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'PT Serif', value: 'PT Serif' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Anton', value: 'Anton' },
  { label: 'Josefin Sans', value: 'Josefin Sans' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville' },
  { label: 'Ubuntu', value: 'Ubuntu' },
  { label: 'Rubik', value: 'Rubik' },
  { label: 'Work Sans', value: 'Work Sans' },
  { label: 'Crimson Text', value: 'Crimson Text' },
  { label: 'Source Sans Pro', value: 'Source Sans Pro' },
];

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(s => !s)} className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-muted hover:text-text-dim uppercase tracking-wider transition-colors">
        {title} {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
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

const TI: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; type?: string }> = ({
  value, onChange, placeholder, multiline, type = 'text',
}) => multiline ? (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
    className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60 resize-none" />
) : (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60" />
);

// Local image upload → objectURL
const LocalImageUpload: React.FC<{ onUrl: (url: string) => void }> = ({ onUrl }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        onUrl(url);
        e.target.value = '';
      }} />
      <button onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted hover:border-accent/50 hover:text-text-dim transition-all w-full justify-center">
        <Upload size={12} /> Upload from computer
      </button>
      <p className="text-xs text-muted mt-1 text-center">Or paste a URL below</p>
    </div>
  );
};

const FontSelect: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <Field label={label}>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60">
      <option value="">Default</option>
      {GOOGLE_FONTS.map(f => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  </Field>
);

const LINK_HINT = '#section  or  /page  or  https://...';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedSection,
    updateSectionContent,
    updateSectionStyle,
    updateSection,
    updateSectionItem,
    addSectionItem,
    removeSectionItem,
    changeVariant
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
          <div className="w-10 h-10 rounded-xl border border-dashed border-border flex items-center justify-center"><Settings2 size={18} className="text-muted" /></div>
          <p className="text-xs text-muted leading-relaxed">Click a section on the canvas to edit its properties.</p>
        </div>
      </aside>
    );
  }

  const c = section.content;
  const s = section.styles;
  const upC = (k: string, v: string) => updateSectionContent(section.id, k, v);
  const upS = (k: string, v: string) => updateSectionStyle(section.id, k, v);
  const variants = SECTION_VARIANTS[section.type]?.variants || [];

  return (
    <aside className="w-64 bg-panel border-l border-border flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Settings2 size={14} className="text-muted" />
        <span className="text-xs font-display font-semibold text-text-dim uppercase tracking-wider capitalize">{section.type}</span>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Design Variant */}
        {variants.length > 1 && (
          <Accordion title="Design Variant">
            <div className="flex flex-col gap-2">
{variants.map(v => (
                 <button key={v.id} onClick={() => changeVariant(section.id, section.type, v.id)}
                   className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left',
                     section.variant === v.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:border-zinc-600 hover:text-text-dim')}>
                   <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', section.variant === v.id ? 'bg-accent' : 'bg-border')} />
                   {v.label}
                 </button>
               ))}
             </div>
           </Accordion>
        )}


        {/* Colors & Background */}
        <Accordion title="Colors & Background">
          <ColorPicker label="Background Color" value={s.bg} onChange={v => upS('bg', v)} />
          <Field label="Background Image">
            <LocalImageUpload onUrl={v => upS('backgroundImage', v)} />
            <TI value={s.backgroundImage || ''} onChange={v => upS('backgroundImage', v)} placeholder="https://..." />
            {s.backgroundImage && (
              <>
                <img src={s.backgroundImage} alt="" className="w-full h-14 object-cover rounded-lg border border-border mt-1" />
                <button onClick={() => upS('backgroundImage', '')} className="text-xs text-red-400 hover:text-red-300 mt-0.5">✕ Remove image</button>
              </>
            )}
          </Field>
          {s.backgroundImage && (
            <>
              <Field label="Overlay Color">
                <TI value={s.backgroundOverlay || 'rgba(0,0,0,0.4)'} onChange={v => upS('backgroundOverlay', v)} placeholder="rgba(0,0,0,0.4)" />
                <p className="text-xs text-muted">Use rgba(r,g,b,opacity)</p>
              </Field>
              <Field label="Image Size">
                <select value={s.backgroundSize || 'cover'} onChange={e => upS('backgroundSize', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none">
                  <option value="cover">Cover (fill)</option>
                  <option value="contain">Contain (fit)</option>
                  <option value="auto">Auto</option>
                </select>
              </Field>
              <Field label="Image Position">
                <select value={s.backgroundPosition || 'center'} onChange={e => upS('backgroundPosition', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none">
                  {['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </> 
          )}
          <ColorPicker label="Text Color" value={s.textColor} onChange={v => upS('textColor', v)} />
          <ColorPicker label="Heading Color" value={s.headingColor || s.textColor} onChange={v => upS('headingColor', v)} />
          <ColorPicker label="Accent Color" value={s.accentColor} onChange={v => upS('accentColor', v)} />
          <ColorPicker label="Muted / Subtitle" value={s.mutedColor || '#6b7280'} onChange={v => upS('mutedColor', v)} />
          <ColorPicker label="Card Background" value={s.cardBg || '#f9fafb'} onChange={v => upS('cardBg', v)} />
          <ColorPicker label="Border Color" value={s.borderColor || '#e5e7eb'} onChange={v => upS('borderColor', v)} />
        </Accordion>

        {/* Fonts */}
        <Accordion title="Fonts" defaultOpen={false}>
          <FontSelect label="Heading Font" value={s.headingFont || ''} onChange={v => upS('headingFont', v)} />
          <FontSelect label="Body Font" value={s.bodyFont || ''} onChange={v => upS('bodyFont', v)} />
          <p className="text-xs text-muted leading-relaxed">Google Fonts are loaded automatically on the published site.</p>
        </Accordion>

        {/* NAVBAR */}
        {section.type === 'navbar' && (
          <Accordion title="Navigation">
            <Field label="Brand Name"><TI value={c.brand || ''} onChange={v => upC('brand', v)} placeholder="MyBrand" /></Field>
            <Field label="Logo">
              <LocalImageUpload onUrl={v => upC('logo', v)} />
              <TI value={c.logo || ''} onChange={v => upC('logo', v)} placeholder="https://..." />
              {c.logo && (
                <>
                  <img src={c.logo} alt="Logo" className="w-full h-14 object-contain rounded-lg border border-border mt-1" />
                  <button onClick={() => upC('logo', '')} className="text-xs text-red-400 hover:text-red-300 mt-0.5">✕ Remove logo</button>
                </>
              )}
            </Field>
            <Field label="Logo Mode">
              <select value={c.logoMode || 'both'} onChange={e => upC('logoMode', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent/60">
                <option value="both">Logo + Text</option>
                <option value="logo">Logo Only</option>
                <option value="text">Text Only</option>
              </select>
            </Field>
            <Field label="CTA Button Text"><TI value={c.ctaText || ''} onChange={v => upC('ctaText', v)} placeholder="Get Started" /></Field>
            <Field label="CTA Link"><TI value={c.ctaLink || ''} onChange={v => upC('ctaLink', v)} placeholder={LINK_HINT} /></Field>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-medium block mb-2">Nav Links</label>
              <p className="text-xs text-muted mb-2">Use <code className="text-accent/80">#about</code> to scroll to a section, or <code className="text-accent/80">/contact</code> to open a page.</p>
              {(section.navLinks || []).map((link, i) => (
                <div key={i} className="flex gap-1 mb-1.5">
                  <input value={link.label} onChange={e => updateSection(section.id, { navLinks: (section.navLinks||[]).map((l, j) => j === i ? {...l, label: e.target.value} : l ) })}
                    className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="Label" />
                  <input value={link.href} onChange={e => updateSection(section.id, { navLinks: (section.navLinks||[]).map((l, j) => j === i ? {...l, href: e.target.value} : l ) })}
                    className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none font-mono" placeholder="#section or /page" />
                  <button onClick={() => updateSection(section.id, { navLinks: (section.navLinks||[]).filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-300 px-1"><Trash2 size={11} /></button>
                </div>
              ))}
              <button onClick={() => updateSection(section.id, { navLinks: [...(section.navLinks||[]), { label: 'New Link', href: '#' }] })}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-dim mt-1"><Plus size={11} /> Add nav link</button>
            </div>
          </Accordion>
        )}

        {/* HERO */}
        {section.type === 'hero' && (
          <Accordion title="Content & Links">
            <Field label="Badge"><TI value={c.badge || ''} onChange={v => upC('badge', v)} placeholder="✦ Welcome" /></Field>
            <Field label="Heading"><TI value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
            <Field label="Subheading"><TI value={c.subheading || ''} onChange={v => upC('subheading', v)} multiline /></Field>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Primary Button</p>
              <Field label="Text"><TI value={c.ctaText || ''} onChange={v => upC('ctaText', v)} placeholder="Get Started" /></Field>
              <Field label="Link"><TI value={c.ctaLink || ''} onChange={v => upC('ctaLink', v)} placeholder={LINK_HINT} /></Field>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Secondary Button</p>
              <Field label="Text"><TI value={c.cta2Text || ''} onChange={v => upC('cta2Text', v)} placeholder="Learn More" /></Field>
              <Field label="Link"><TI value={c.cta2Link || ''} onChange={v => upC('cta2Link', v)} placeholder={LINK_HINT} /></Field>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Hero Image</p>
              <LocalImageUpload onUrl={v => upC('image', v)} />
              <Field label="Or image URL"><TI value={c.image || ''} onChange={v => upC('image', v)} placeholder="https://..." /></Field>
            </div>
            {section.variant === 4 && <Field label="Overlay Opacity (0–1)"><TI value={c.overlayOpacity || '0.5'} onChange={v => upC('overlayOpacity', v)} /></Field>}
          </Accordion>
        )}

        {/* ABOUT */}
        {section.type === 'about' && (
          <Accordion title="Content">
            <Field label="Badge"><TI value={c.badge || ''} onChange={v => upC('badge', v)} /></Field>
            <Field label="Heading"><TI value={c.heading || ''} onChange={v => upC('heading', v)} multiline /></Field>
            <Field label="Body Text"><TI value={c.body || ''} onChange={v => upC('body', v)} multiline /></Field>
            {['point1','point2','point3'].map((k,i) => <Field key={k} label={`Bullet ${i+1}`}><TI value={c[k]||''} onChange={v=>upC(k,v)} /></Field>)}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">CTA Button</p>
              <Field label="Text"><TI value={c.ctaText||''} onChange={v=>upC('ctaText',v)} /></Field>
              <Field label="Link"><TI value={c.ctaLink||''} onChange={v=>upC('ctaLink',v)} placeholder={LINK_HINT} /></Field>
            </div>
            <div className="border-t border-border pt-3">
              <LocalImageUpload onUrl={v => upC('image', v)} />
              <Field label="Or image URL"><TI value={c.image||''} onChange={v=>upC('image',v)} placeholder="https://..." /></Field>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Stats</p>
              {[['stat1Value','Stat 1 Value'],['stat1Label','Stat 1 Label'],['stat2Value','Stat 2 Value'],['stat2Label','Stat 2 Label'],['stat3Value','Stat 3 Value'],['stat3Label','Stat 3 Label']].map(([k,l])=>(
                <Field key={k} label={l}><TI value={c[k]||''} onChange={v=>upC(k,v)} /></Field>
              ))}
            </div>
          </Accordion>
        )}

        {/* SERVICES */}
        {section.type === 'services' && (<>
          <Accordion title="Heading">
            <Field label="Badge"><TI value={c.badge||''} onChange={v=>upC('badge',v)} /></Field>
            <Field label="Heading"><TI value={c.heading||''} onChange={v=>upC('heading',v)} multiline /></Field>
            <Field label="Subheading"><TI value={c.subheading||''} onChange={v=>upC('subheading',v)} multiline /></Field>
          </Accordion>
          <Accordion title="Services">
            {(section.items||[]).map((item,i)=>(
              <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-xs font-semibold text-text-dim">#{i+1}</span><button onClick={()=>removeSectionItem(section.id,item.id)} className="text-red-400"><Trash2 size={11}/></button></div>
                <TI value={item.icon||''} onChange={v=>updateSectionItem(section.id,item.id,{icon:v})} placeholder="Emoji icon" />
                <TI value={item.title||''} onChange={v=>updateSectionItem(section.id,item.id,{title:v})} placeholder="Title" />
                <TI value={item.description||''} onChange={v=>updateSectionItem(section.id,item.id,{description:v})} placeholder="Description" multiline />
                <TI value={item.href||''} onChange={v=>updateSectionItem(section.id,item.id,{href:v})} placeholder={`Link — ${LINK_HINT}`} />
              </div>
            ))}
            <button onClick={()=>addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent mt-1"><Plus size={11}/>Add service</button>
          </Accordion>
        </>)}

        {/* TESTIMONIALS */}
        {section.type === 'testimonials' && (<>
          <Accordion title="Heading">
            <Field label="Badge"><TI value={c.badge||''} onChange={v=>upC('badge',v)} /></Field>
            <Field label="Heading"><TI value={c.heading||''} onChange={v=>upC('heading',v)} multiline /></Field>
            <Field label="Subheading"><TI value={c.subheading||''} onChange={v=>upC('subheading',v)} multiline /></Field>
          </Accordion>
          <Accordion title="Reviews">
            {(section.items||[]).map((item,i)=>(
              <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-xs font-semibold text-text-dim">Review #{i+1}</span><button onClick={()=>removeSectionItem(section.id,item.id)} className="text-red-400"><Trash2 size={11}/></button></div>
                <TI value={item.quote||''} onChange={v=>updateSectionItem(section.id,item.id,{quote:v})} placeholder="Quote" multiline />
                <TI value={item.name||''} onChange={v=>updateSectionItem(section.id,item.id,{name:v})} placeholder="Name" />
                <TI value={item.role||''} onChange={v=>updateSectionItem(section.id,item.id,{role:v})} placeholder="Role, Company" />
                <TI value={item.image||''} onChange={v=>updateSectionItem(section.id,item.id,{image:v})} placeholder="Avatar URL" />
              </div>
            ))}
            <button onClick={()=>addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent mt-1"><Plus size={11}/>Add review</button>
          </Accordion>
        </>)}

        {/* FAQ */}
        {section.type === 'faq' && (<>
          <Accordion title="Heading">
            <Field label="Badge"><TI value={c.badge||''} onChange={v=>upC('badge',v)} /></Field>
            <Field label="Heading"><TI value={c.heading||''} onChange={v=>upC('heading',v)} multiline /></Field>
            <Field label="Subheading"><TI value={c.subheading||''} onChange={v=>upC('subheading',v)} multiline /></Field>
          </Accordion>
          <Accordion title="Questions">
            {(section.items||[]).map((item,i)=>(
              <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-xs font-semibold text-text-dim">Q#{i+1}</span><button onClick={()=>removeSectionItem(section.id,item.id)} className="text-red-400"><Trash2 size={11}/></button></div>
                <TI value={item.question||''} onChange={v=>updateSectionItem(section.id,item.id,{question:v})} placeholder="Question" />
                <TI value={item.answer||''} onChange={v=>updateSectionItem(section.id,item.id,{answer:v})} placeholder="Answer" multiline />
              </div>
            ))}
            <button onClick={()=>addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent mt-1"><Plus size={11}/>Add question</button>
          </Accordion>
        </>)}

        {/* CONTACT */}
        {section.type === 'contact' && (
          <Accordion title="Contact Info">
            <Field label="Badge"><TI value={c.badge||''} onChange={v=>upC('badge',v)} /></Field>
            <Field label="Heading"><TI value={c.heading||''} onChange={v=>upC('heading',v)} multiline /></Field>
            <Field label="Subheading"><TI value={c.subheading||''} onChange={v=>upC('subheading',v)} multiline /></Field>
            <Field label="Email"><TI value={c.email||''} onChange={v=>upC('email',v)} type="email" /></Field>
            <Field label="Phone"><TI value={c.phone||''} onChange={v=>upC('phone',v)} /></Field>
            <Field label="Address"><TI value={c.address||''} onChange={v=>upC('address',v)} /></Field>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">WhatsApp</p>
              <Field label="Number (with country code)"><TI value={c.whatsappPhone||''} onChange={v=>upC('whatsappPhone',v)} placeholder="237600000000" /></Field>
              <Field label="Pre-filled message"><TI value={c.whatsappMessage||''} onChange={v=>upC('whatsappMessage',v)} multiline /></Field>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Form</p>
              <Field label="Send to email"><TI value={c.formRecipient||''} onChange={v=>upC('formRecipient',v)} type="email" /></Field>
              <Field label="Submit button text"><TI value={c.submitLabel||''} onChange={v=>upC('submitLabel',v)} /></Field>
              <Field label="Success message"><TI value={c.successMessage||''} onChange={v=>upC('successMessage',v)} /></Field>
            </div>
          </Accordion>
        )}

        {/* FOOTER */}
        {section.type === 'footer' && (<>
          <Accordion title="Brand">
            <Field label="Brand Name"><TI value={c.brand||''} onChange={v=>upC('brand',v)} /></Field>
            <Field label="Tagline"><TI value={c.tagline||''} onChange={v=>upC('tagline',v)} multiline /></Field>
            <Field label="Email"><TI value={c.email||''} onChange={v=>upC('email',v)} /></Field>
            <Field label="Phone"><TI value={c.phone||''} onChange={v=>upC('phone',v)} /></Field>
            <Field label="Copyright"><TI value={c.copyright||''} onChange={v=>upC('copyright',v)} /></Field>
          </Accordion>
          <Accordion title="Link Groups">
            {(section.items||[]).map((group) => (


              <div key={group.id} className="border border-border rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <input value={group.group||''} onChange={e=>updateSectionItem(section.id,group.id,{group:e.target.value})}
                    className="text-xs font-semibold bg-transparent text-text-dim border-b border-border outline-none w-24" placeholder="Group name" />
                  <button onClick={()=>removeSectionItem(section.id,group.id)} className="text-red-400"><Trash2 size={11}/></button>
                </div>
                {(group.links||[]).map((link,j)=>(
                  <div key={j} className="flex gap-1 mb-1">
                    <input value={link.label} onChange={e=>updateSectionItem(section.id, group.id, {links: (group.links||[]).map((l, k) => k === j ? {...l, label: e.target.value} : l)})}
                      className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none" placeholder="Label" />
                    <input value={link.href} onChange={e=>updateSectionItem(section.id, group.id, {links: (group.links||[]).map((l, k) => k === j ? {...l, href: e.target.value} : l)})}
                      className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text outline-none font-mono" placeholder="#section or /page" />
                  </div>
                ))}
                <button onClick={()=>{
                  const newLinks = [...(group.links||[]), { label: 'Link', href: '#' }];
                  updateSectionItem(section.id, group.id, {links: newLinks});
                }} className="text-xs text-accent mt-1 flex items-center gap-1"><Plus size={10}/>Add link</button>
              </div>
            ))}
            <button onClick={()=>addSectionItem(section.id)} className="flex items-center gap-1 text-xs text-accent mt-1"><Plus size={11}/>Add group</button>
          </Accordion>
        </>)}

        {/* Link guide */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Link Guide</p>
          <div className="space-y-1.5 text-xs text-muted">
            <p><code className="text-accent/80">#about</code> — scroll to section on same page</p>
            <p><code className="text-accent/80">/about</code> — navigate to About page</p>
            <p><code className="text-accent/80">https://...</code> — external site</p>
            <p><code className="text-accent/80">mailto:you@email.com</code> — email</p>
            <p><code className="text-accent/80">tel:+237600000000</code> — phone</p>
          </div>
        </div>

      </div>
    </aside>
  );
};

