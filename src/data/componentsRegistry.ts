import React from 'react';
import Folder from '../components/ui/frost_vault/Folder';
import FolderFooter from '../components/ui/frost_vault/FolderFooter';
import folderCode from '../components/ui/frost_vault/Folder.tsx?raw';

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  component: React.ComponentType<any>;
  footerComponent?: React.ComponentType<any>;
  code: string;
  colorOptions?: string[];
  sizeOptions?: string[];
  defaultColor?: string;
  defaultSize?: string;
  dependencies?: string[];
  cliCommand?: string;
}

export const componentsRegistry: Record<string, ComponentItem> = {
  'frost-vault': {
    id: 'frost-vault',
    name: 'Frost Vault',
    category: 'Components',
    description: 'An interactive 3D glass folder component featuring animated card reveals, customizable color themes, spring dynamics, and responsive scale options.',
    component: Folder,
    footerComponent: FolderFooter,
    code: folderCode,
    colorOptions: ['black', 'white', 'blue'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add frost-vault',
  },
  'liquid-orb': {
    id: 'liquid-orb',
    name: 'Liquid Orb',
    category: 'Components',
    description: 'Dynamic reactive fluid sphere powered by real-time particle shaders and audio-reactive physics.',
    component: Folder,
    code: '// Liquid Orb Component coming soon\nexport default function LiquidOrb() { return <div>Liquid Orb</div>; }',
    dependencies: ['motion', 'three'],
    cliCommand: 'npx atronix add liquid-orb',
  },
  'dynamic-island': {
    id: 'dynamic-island',
    name: 'Dynamic Island',
    category: 'Components',
    description: 'Adaptive status pill with fluid morphing dimensions, audio feedback, and spring micro-interactions.',
    component: Folder,
    code: '// Dynamic Island Component\nexport default function DynamicIsland() { return <div>Dynamic Island</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add dynamic-island',
  },
  'gravion-motion': {
    id: 'gravion-motion',
    name: 'Gravion Motion',
    category: 'Components',
    description: 'Physics-based gravity field with cursor-reactive collision simulation and ambient inertia damping.',
    component: Folder,
    code: '// Gravion Motion Component\nexport default function GravionMotion() { return <div>Gravion Motion</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add gravion-motion',
  },
  'obsidian-card': {
    id: 'obsidian-card',
    name: 'Obsidian Card',
    category: 'Components',
    description: 'Ultra-deep obsidian glass card with dynamic optical glare and specular edge refraction.',
    component: Folder,
    code: '// Obsidian Card Component\nexport default function ObsidianCard() { return <div>Obsidian Card</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add obsidian-card',
  },
  'quantum-modal': {
    id: 'quantum-modal',
    name: 'Quantum Modal',
    category: 'Components',
    description: 'Spring-driven glassmorphic dialog with backdrop blur layers and fluid exit gesture drag.',
    component: Folder,
    code: '// Quantum Modal Component\nexport default function QuantumModal() { return <div>Quantum Modal</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add quantum-modal',
  },
  'hyper-glow-button': {
    id: 'hyper-glow-button',
    name: 'Hyper Glow Button',
    category: 'Components',
    description: 'Specular laser reactive CTA button with glowing perimeter border beam and haptic response.',
    component: Folder,
    code: '// Hyper Glow Button Component\nexport default function HyperGlowButton() { return <div>Hyper Glow Button</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add hyper-glow-button',
  },
  'matrix-grid': {
    id: 'matrix-grid',
    name: 'Matrix Grid',
    category: 'Components',
    description: 'Interactive ambient background grid mesh with ripple disturbance wave physics.',
    component: Folder,
    code: '// Matrix Grid Component\nexport default function MatrixGrid() { return <div>Matrix Grid</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add matrix-grid',
  },
  'prism-slider': {
    id: 'prism-slider',
    name: 'Prism Slider',
    category: 'Components',
    description: 'Fluid stepped range slider with liquid thumb tracking and tactile value indicator tooltip.',
    component: Folder,
    code: '// Prism Slider Component\nexport default function PrismSlider() { return <div>Prism Slider</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add prism-slider',
  },
  'nexus-tabs': {
    id: 'nexus-tabs',
    name: 'Nexus Tabs',
    category: 'Components',
    description: 'Liquid morphing segmented navigation bar with stretch spring physics and magnetic hover.',
    component: Folder,
    code: '// Nexus Tabs Component\nexport default function NexusTabs() { return <div>Nexus Tabs</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add nexus-tabs',
  },
  'aether-dropdown': {
    id: 'aether-dropdown',
    name: 'Aether Dropdown',
    category: 'Components',
    description: 'Frosted glass animated select dropdown with keyboard navigation and spring accordion flow.',
    component: Folder,
    code: '// Aether Dropdown Component\nexport default function AetherDropdown() { return <div>Aether Dropdown</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add aether-dropdown',
  },
  'starlight-tooltip': {
    id: 'starlight-tooltip',
    name: 'Starlight Tooltip',
    category: 'Components',
    description: 'Adaptive floating tooltip bubble with physics collision bounds and soft optical halo.',
    component: Folder,
    code: '// Starlight Tooltip Component\nexport default function StarlightTooltip() { return <div>Starlight Tooltip</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add starlight-tooltip',
  },
  'vortex-drawer': {
    id: 'vortex-drawer',
    name: 'Vortex Drawer',
    category: 'Components',
    description: 'Directional bottom and side sheet drawer with velocity-based flick dismiss and rubber-band drag.',
    component: Folder,
    code: '// Vortex Drawer Component\nexport default function VortexDrawer() { return <div>Vortex Drawer</div>; }',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add vortex-drawer',
  },
};

export default componentsRegistry;
