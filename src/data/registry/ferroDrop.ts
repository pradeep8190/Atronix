import React from 'react';
import type { ComponentItem } from './types';

export const ferroDrop: ComponentItem = {
  id: 'ferro-drop',
  name: 'Ferro Drop',
  category: 'Components',
  description: 'Magnetic AI prompt bar with ferrofluid boundary pull. Features real-time border magnetic attraction toward dragged files, Venom-like harmonic assimilation shockwaves, and procedural Web Audio haptic latching.',
  component: React.lazy(() => import('../../components/ui/ferro_drop/FerroDrop')),
  footerComponent: React.lazy(() => import('../../components/ui/ferro_drop/FerroDropFooter')),
  loadCode: () => import('../../components/ui/ferro_drop/FerroDrop.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/ferro_drop/FerroDrop.tsx?raw').then((m) => m.default),
      import('../../components/ui/ferro_drop/FerroDrop.css?raw').then((m) => m.default),
    ]);
    return { 'FerroDrop.tsx': tsx, 'FerroDrop.css': css };
  },
  getUsageCode: () => `import { FerroDrop } from '@/components/ui/ferro_drop/FerroDrop';
import '@/components/ui/ferro_drop/FerroDrop.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <FerroDrop />
    </div>
  );
}`,
  colorOptions: ['black', 'blue', 'amber', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add ferro-drop',
  hint: 'Drag any local file or the sample chip over the bar to see the magnetic border pull, then release to assimilate!',
};

export default ferroDrop;
