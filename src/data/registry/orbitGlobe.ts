import React from 'react';
import type { ComponentItem } from './types';

export const orbitGlobe: ComponentItem = {
  id: 'orbit-globe',
  name: 'Orbit Globe',
  category: 'Components',
  description: '3D interactive wireframe orbital globe featuring Natural Earth vector coastlines, latitude/longitude meridians, great-circle flight arcs, pulsing travelling photons, and momentum drag physics.',
  component: React.lazy(() => import('../../components/ui/orbit_globe/OrbitGlobe')),
  footerComponent: React.lazy(() => import('../../components/ui/orbit_globe/OrbitGlobeFooter')),
  loadCode: () => import('../../components/ui/orbit_globe/OrbitGlobe.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/orbit_globe/OrbitGlobe.tsx?raw').then((m) => m.default),
      import('../../components/ui/orbit_globe/OrbitGlobe.css?raw').then((m) => m.default),
    ]);
    return { 'OrbitGlobe.tsx': tsx, 'OrbitGlobe.css': css };
  },
  getUsageCode: () => `import { OrbitGlobe } from '@/components/ui/orbit_globe/OrbitGlobe';
import '@/components/ui/orbit_globe/OrbitGlobe.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <OrbitGlobe />
    </div>
  );
}`,
  colorOptions: ['black', 'red', 'amber', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add orbit-globe',
  hint: 'Click and drag in any direction to spin the 3D globe with natural planetary momentum!',
};

export default orbitGlobe;
