import type { SectionStyles } from '../types';

/**
 * Builds the outer section style object handling:
 * - solid bg color
 * - background image with optional overlay
 * - all other style props
 */
export function getSectionBgStyle(styles: SectionStyles): React.CSSProperties {
  const base: React.CSSProperties = {};

  if (styles.backgroundImage) {
    base.backgroundImage = `url(${styles.backgroundImage})`;
    base.backgroundSize = styles.backgroundSize || 'cover';
    base.backgroundPosition = styles.backgroundPosition || 'center';
    base.backgroundRepeat = 'no-repeat';
    // bg color becomes the fallback / overlay base
    base.backgroundColor = styles.bg || '#000000';
  } else {
    base.background = styles.bg;
  }

  return base;
}

/**
 * If the section has a background image, returns an overlay div style.
 * Use inside the section as the first child: <div style={getOverlayStyle(styles)} />
 */
export function getOverlayStyle(styles: SectionStyles): React.CSSProperties | null {
  if (!styles.backgroundImage) return null;
  const opacity = styles.backgroundOverlay || 'rgba(0,0,0,0.4)';
  return {
    position: 'absolute',
    inset: 0,
    background: opacity,
    pointerEvents: 'none',
    zIndex: 0,
  };
}

/**
 * Content inside a section with a background image needs position:relative + z-index:1
 */
export function getContentStyle(styles: SectionStyles): React.CSSProperties {
  return styles.backgroundImage ? { position: 'relative', zIndex: 1 } : {};
}