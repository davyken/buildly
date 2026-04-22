import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, GripVertical, Copy } from 'lucide-react';
import { useSiteStore } from '../../stores/siteStore';

const SECTION_ICONS: Record<string, string> = {
  navbar: '🧭', hero: '✦', about: '🧑‍💼', services: '⚡',
  testimonials: '💬', faq: '❓', contact: '📨', footer: '⬛',
};

export const LayersPanel: React.FC = () => {
  const {
    site, activePageId, selectedSectionId,
    selectSection, updateSection, deleteSection, duplicateSection,
    moveSectionUp, moveSectionDown, reorderSections,
  } = useSiteStore();

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const page = site?.pages.find((p) => p.id === activePageId);
  const sections = page?.sections ?? [];

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== draggingIdx) setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    if (draggingIdx !== null && draggingIdx !== toIdx) {
      reorderSections(draggingIdx, toIdx);
    }
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-2 py-8">
        <p className="text-xs text-muted">No sections yet.</p>
        <p className="text-xs text-muted opacity-60">Add sections using the Elements tab.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-muted border-b border-border">
        Drag rows to reorder • {sections.length} section{sections.length !== 1 ? 's' : ''}
      </div>
      <div className="flex flex-col py-1">
        {sections.map((section, idx) => {
          const isSelected = section.id === selectedSectionId;
          const isDragging = draggingIdx === idx;
          const isOver = dragOverIdx === idx;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => selectSection(section.id)}
              className={clsx(
                'group flex items-center gap-2 px-3 py-2 cursor-pointer transition-all border-l-2',
                isSelected ? 'bg-accent/10 border-l-accent' : 'border-l-transparent hover:bg-white/5',
                isDragging && 'opacity-40',
                isOver && draggingIdx !== null && 'border-t-2 border-t-accent',
              )}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 text-muted cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100">
                <GripVertical size={13} />
              </div>

              {/* Icon */}
              <span className="text-sm flex-shrink-0">{SECTION_ICONS[section.type] || '■'}</span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={clsx('text-xs font-medium truncate capitalize', isSelected ? 'text-accent' : 'text-text-dim')}>
                  {section.type}
                </p>
                {section.content?.heading && (
                  <p className="text-xs text-muted truncate leading-tight">{section.content.heading.slice(0, 28)}</p>
                )}
                {!section.content?.heading && section.content?.brand && (
                  <p className="text-xs text-muted truncate leading-tight">{section.content.brand}</p>
                )}
              </div>

              {/* Actions — only on hover or selected */}
              <div className={clsx('flex items-center gap-0.5 flex-shrink-0', 'opacity-0 group-hover:opacity-100 transition-opacity')}>
                <button onClick={(e) => { e.stopPropagation(); moveSectionUp(section.id); }} disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-white/15 text-muted hover:text-text disabled:opacity-20 transition-colors" title="Move up">
                  <ChevronUp size={11} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); moveSectionDown(section.id); }} disabled={idx === sections.length - 1}
                  className="p-0.5 rounded hover:bg-white/15 text-muted hover:text-text disabled:opacity-20 transition-colors" title="Move down">
                  <ChevronDown size={11} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); updateSection(section.id, { hidden: !section.hidden }); }}
                  className="p-0.5 rounded hover:bg-white/15 text-muted hover:text-text transition-colors" title={section.hidden ? 'Show' : 'Hide'}>
                  {section.hidden ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                  className="p-0.5 rounded hover:bg-white/15 text-muted hover:text-text transition-colors" title="Duplicate">
                  <Copy size={11} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete this ${section.type} section?`)) deleteSection(section.id); }}
                  className="p-0.5 rounded hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};