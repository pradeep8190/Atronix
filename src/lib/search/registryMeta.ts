import type { SearchDocument } from './types';
import componentsRegistry from '../../data/componentsRegistry';
import templatesRegistry from '../../data/templatesRegistry';

export interface ComponentSearchMetadata {
  aliases: string[];
  tags: string[];
  curatedCategory: string;
}

export const COMPONENT_METADATA_MAP: Record<string, ComponentSearchMetadata> = {
  'frost-vault': {
    curatedCategory: 'Surfaces & Cards',
    aliases: [
      'folder',
      'glass folder',
      'premium folder',
      '3d folder',
      'cards reveal',
      'file organizer',
      'vault',
      'tabs container',
      'document deck',
      'file drawer',
      'frosted glass',
    ],
    tags: ['3d', 'glassmorphism', 'interactive', 'card deck', 'spring', 'reveal', 'vault'],
  },
  'graviton-field': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'graviton',
      'gravity',
      'magnetic cursor',
      'cursor attraction',
      'particles',
      'force field',
      'particle web',
      'attractor',
      'orbit field',
      'black hole',
      'repulsion',
    ],
    tags: ['webgl', 'physics', 'particles', 'cursor', 'interactive', 'gravity', 'mesh'],
  },
  'quantum-morph': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'quantum',
      'morph',
      'shader ball',
      'liquid sphere',
      'organic blob',
      'deformation',
      'noise mesh',
      '3d sphere',
      'simplex noise',
      'fluid mesh',
    ],
    tags: ['webgl', 'sdf', 'shader', '3d', 'morph', 'fluid', 'organic'],
  },
  'liquid-mitosis': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'mitosis',
      'metaballs',
      'liquid split',
      'cell division',
      'gooey blobs',
      'lava lamp',
      'fluid droplets',
      'blob merger',
      'viscous balls',
    ],
    tags: ['webgl', 'fluid', 'metaballs', 'sdf', 'viscous', 'organic', 'cell'],
  },
  'mercury-slider': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'mercury',
      'liquid slider',
      'fluid slider',
      'range slider',
      'volume slider',
      'chrome slider',
      'metallic slider',
      'drag input',
      'scrubber',
    ],
    tags: ['slider', 'controls', 'fluid', 'mercury', 'liquid', 'input', 'interactive'],
  },
  'hydro-button': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'hydro',
      'water button',
      'fluid button',
      'liquid ripple',
      'splash button',
      'viscous click',
      'water splash',
      'cta button',
    ],
    tags: ['button', 'liquid', 'fluid', 'ripple', 'interactive', 'controls', 'water'],
  },
  'cascade-select': {
    curatedCategory: 'Navigation & Select',
    aliases: [
      'cascade',
      'dropdown',
      'select menu',
      'accordion list',
      'combobox',
      'option picker',
      'nested select',
      'popover menu',
    ],
    tags: ['select', 'dropdown', 'inputs', 'menu', 'accordion', 'interactive'],
  },
  'phase-toggle': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'phase',
      'toggle',
      'switch',
      'dark mode toggle',
      'checkbox switch',
      'state toggle',
      'flip switch',
      'boolean switch',
    ],
    tags: ['switch', 'toggle', 'inputs', 'controls', 'state', 'interactive'],
  },
  'aero-core': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'aero',
      'cyber core',
      'turbine',
      'aerodynamics',
      'hologram ring',
      'vortex generator',
      'engine core',
      'reactor ring',
    ],
    tags: ['cyberpunk', 'core', 'glow', 'holographic', 'ambient', 'reactor'],
  },
  'ferro-drop': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'ferro',
      'ferrofluid',
      'magnetic fluid',
      'black liquid',
      'spiky fluid',
      'magnetic drop',
      'liquid magnet',
      'iron droplet',
    ],
    tags: ['webgl', 'fluid', 'magnetic', 'ferrofluid', 'shader', 'physics'],
  },
  'pendant-lamp': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'lamp',
      'pendant lamp',
      'hanging light',
      'light bulb',
      'ceiling lamp',
      'cord pull',
      'pendulum light',
      'ambient light',
    ],
    tags: ['light', 'physics', 'lamp', 'pendulum', 'lighting', 'interactive'],
  },
  'orbit-globe': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'globe',
      'orbit globe',
      'wireframe earth',
      '3d sphere',
      'world telemetry',
      'rotating planet',
      'dots globe',
      'geography',
    ],
    tags: ['3d', 'globe', 'sphere', 'world', 'telemetry', 'interactive'],
  },
  'speed-rays': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'speed rays',
      'warp speed',
      'hyperspace',
      'light rays',
      'starfield rays',
      'tunnel effect',
      'acceleration lines',
      'speed streaks',
    ],
    tags: ['motion', 'rays', 'speed', 'hero', 'warp', 'light', 'background'],
  },
  'tyndall-beam': {
    curatedCategory: 'WebGL & Physics',
    aliases: [
      'tyndall',
      'god rays',
      'volumetric light',
      'light beam',
      'sunbeam',
      'fog beam',
      'atmospheric glow',
      'crepuscular rays',
    ],
    tags: ['lighting', 'volumetric', 'god-rays', 'tyndall', 'atmosphere', 'beam'],
  },
  'flux-scale': {
    curatedCategory: 'Pricing & Tiers',
    aliases: [
      'pricing table',
      'flux scale',
      'pricing matrix',
      'comparison tiers',
      'subscription plans',
      'price cards',
      'specular pricing',
    ],
    tags: ['pricing', 'table', 'matrix', 'comparison', 'plans', 'tiers'],
  },
  'eclipse-switch': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'eclipse switch',
      'eclipse toggle',
      'eclipse',
      'theme change',
      'theme switcher',
      'theme toggle',
      'dark mode switch',
      'light mode switch',
      'day night switch',
      'liquid glass switch',
      'optical toggle',
      'sun moon switch',
    ],
    tags: ['eclipse', 'celestial', 'liquid-glass', 'theme', 'dark-mode', 'switch', 'toggle', 'webgl', 'refraction', 'snell'],
  },
  'theme-change': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'eclipse switch',
      'theme change',
    ],
    tags: ['eclipse', 'theme', 'switch'],
  },
  'silica-slider': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'silica slider',
      'silica',
      'liquid glass slider',
      'optical slider',
      'ruby slider',
      'glass range',
      'snell slider',
      'jelly slider',
      'spring slider',
      'volume slider',
      'intensity slider',
    ],
    tags: ['silica', 'liquid-glass', 'slider', 'range', 'webgl', 'refraction', 'snell', 'jelly', 'spring', 'caustics'],
  },
  'liquid-glass-slider': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'silica slider',
      'liquid glass slider',
    ],
    tags: ['silica', 'liquid-glass', 'slider'],
  },
  'lens-strip': {
    curatedCategory: 'Navigation & Select',
    aliases: [
      'lens strip',
      'lens picker',
      'focus strip',
      'camera roll',
      'video quality selector',
      'resolution selector',
      'mode selector',
      'optical lens dropdown',
      'wheel picker',
      'carousel picker',
    ],
    tags: ['lens', 'strip', 'liquid-glass', 'picker', 'selector', 'resolution', 'webgl', 'refraction', 'snell', 'momentum'],
  },
  'camera-roll': {
    curatedCategory: 'Navigation & Select',
    aliases: [
      'lens strip',
      'camera roll',
    ],
    tags: ['lens', 'strip', 'camera-roll'],
  },
  'optic-deck': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'optic deck',
      'optic',
      'optic card',
      'liquid glass button',
      'action button',
      'floating action button',
      'fab',
      'unfolding card',
      'glass plus button',
      'optical button',
      'menu button',
      'actions menu',
    ],
    tags: ['optic', 'deck', 'liquid-glass', 'button', 'fab', 'unfold', 'webgl', 'refraction', 'snell', 'card', 'menu'],
  },
  'liquid-glass-button': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'optic deck',
      'liquid glass button',
    ],
    tags: ['optic', 'deck', 'liquid-glass'],
  },
  'kinetic-tabs': {
    curatedCategory: 'Navigation & Select',
    aliases: [
      'kinetic tabs',
      'kinetic',
      'liquid glass navbar',
      'optical navbar',
      'floating dock',
      'glass dock',
      'apple navbar',
      'segmented dock',
      'glass nav',
      'tab bar',
      'navigation bar',
    ],
    tags: ['kinetic', 'tabs', 'liquid-glass', 'navbar', 'dock', 'nav', 'webgl', 'refraction', 'snell', 'jello', 'spring'],
  },
  'liquid-glass-navbar': {
    curatedCategory: 'Navigation & Select',
    aliases: [
      'kinetic tabs',
      'liquid glass navbar',
    ],
    tags: ['kinetic', 'tabs', 'liquid-glass'],
  },
  'plasma-button': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'plasma button',
      'plasma toggle',
      'liquid glass toggle',
      'ampoule button',
      'ionized gas button',
      'solar emerald switch',
      'glass switch',
      'plasma switch',
    ],
    tags: ['liquid-glass', 'button', 'toggle', 'switch', 'plasma', 'ampoule', 'webgl', 'refraction', 'snell', 'comet'],
  },
  'plasma-toggle': {
    curatedCategory: 'Inputs & Controls',
    aliases: [
      'plasma button',
      'plasma toggle',
    ],
    tags: ['liquid-glass', 'plasma', 'button'],
  },
  'atmosphere-card': {
    curatedCategory: 'Surfaces & Cards',
    aliases: [
      'atmosphere card',
      'climate weather',
      'weather controller',
      'climate card',
      'liquid glass weather',
      'weather widget',
      'temperature card',
      'rolling odometer',
      'weather timeline',
      'open meteo',
      'celsius fahrenheit',
    ],
    tags: ['liquid-glass', 'weather', 'climate', 'temperature', 'odometer', 'timeline', 'webgl', 'refraction', 'snell', 'card'],
  },
  'climate-weather': {
    curatedCategory: 'Surfaces & Cards',
    aliases: [
      'atmosphere card',
      'climate weather',
      'weather controller',
      'climate card',
      'liquid glass weather',
      'weather widget',
      'temperature card',
      'rolling odometer',
      'weather timeline',
      'open meteo',
      'celsius fahrenheit',
    ],
    tags: ['liquid-glass', 'weather', 'climate', 'temperature', 'odometer', 'timeline', 'webgl', 'refraction', 'snell', 'card'],
  },
};

export const TEMPLATE_METADATA_MAP: Record<string, ComponentSearchMetadata> = {
  testimonials: {
    curatedCategory: 'Feedback & Social Proof',
    aliases: [
      'testimonials',
      'reviews deck',
      'customer feedback',
      'social proof',
      'infinite carousel',
      'quote cards',
      '3d perspective deck',
      'rating cards',
    ],
    tags: ['template', 'testimonials', 'reviews', 'social proof', 'carousel', '3d cards'],
  },
  'feedback-deck': {
    curatedCategory: 'Feedback & Social Proof',
    aliases: [
      'feedback',
      'customer review',
      'ratings',
      'social deck',
      'client feedback',
    ],
    tags: ['template', 'feedback', 'reviews', 'carousel'],
  },
  'specular-tier': {
    curatedCategory: 'Pricing & Conversion',
    aliases: [
      'pricing template',
      'subscription tier',
      'membership plans',
      'pro pricing',
      'pricing checkout',
      'saas tiers',
      'plan comparison',
    ],
    tags: ['template', 'pricing', 'plans', 'comparison', 'specular', 'matrix'],
  },
};

/**
 * Builds the complete searchable catalog by merging registries with semantic metadata
 */
export function buildSearchCatalog(): SearchDocument[] {
  const documents: SearchDocument[] = [];

  // Index Components
  for (const [id, comp] of Object.entries(componentsRegistry)) {
    const meta = COMPONENT_METADATA_MAP[id] || {
      curatedCategory: comp.category || 'Components',
      aliases: [],
      tags: [],
    };

    documents.push({
      id: comp.id || id,
      name: comp.name,
      type: 'component',
      category: meta.curatedCategory,
      description: comp.description || '',
      aliases: meta.aliases,
      tags: meta.tags,
      cliCommand: comp.cliCommand || `npx atronix add ${id}`,
      url: `/components/${comp.id || id}`,
    });
  }

  // Index Templates
  for (const [id, tmpl] of Object.entries(templatesRegistry)) {
    // avoid duplicates if template has alias keys
    if (documents.some((d) => d.id === (tmpl.id || id))) continue;

    const meta = TEMPLATE_METADATA_MAP[id] || TEMPLATE_METADATA_MAP[tmpl.id] || {
      curatedCategory: 'Templates',
      aliases: [],
      tags: [],
    };

    documents.push({
      id: tmpl.id || id,
      name: tmpl.name,
      type: 'template',
      category: meta.curatedCategory,
      description: tmpl.description || '',
      aliases: meta.aliases,
      tags: meta.tags,
      cliCommand: tmpl.cliCommand || `npx atronix add ${id}`,
      url: `/templates/${tmpl.id || id}`,
    });
  }

  return documents;
}
