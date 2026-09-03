import React from 'react';
import type { ComponentItem } from './types';

export const aeroCore: ComponentItem = {
  id: 'aero-core',
  name: 'Aero Core',
  category: 'Components',
  description: 'Voice-reactive volumetric smoke and celestial nebula orb. Features 5-octave rotational FBM domain warping, acoustic speech billowing, radiant luminous core pulses, and interactive pointer smoke stirring.',
  component: React.lazy(() => import('../../components/ui/aero_core/AeroCore')),
  footerComponent: React.lazy(() => import('../../components/ui/aero_core/AeroCoreFooter')),
  loadCode: () => import('../../components/ui/aero_core/AeroCore.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/aero_core/AeroCore.tsx?raw').then((m) => m.default),
      import('../../components/ui/aero_core/AeroCore.css?raw').then((m) => m.default),
    ]);
    return {
      'AeroCore.tsx': tsx,
      'AeroCore.css': css,
    };
  },
  getUsageCode: () => `import { AeroCore } from '@/components/ui/aero_core/AeroCore';
import '@/components/ui/aero_core/AeroCore.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <AeroCore
        color="purple"
        size="md"
      />
    </div>
  );
}`,
  colorOptions: ['purple', 'black', 'amber', 'blue', 'emerald', 'white'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'purple',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add aero-core',
  hint: 'Move cursor to stir the smoke wisps, or speak to watch the luminous cloud billow and pulse!',
};

export default aeroCore;
