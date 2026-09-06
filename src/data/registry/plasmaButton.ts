import React from 'react';
import type { ComponentItem } from './types';

export const plasmaButton: ComponentItem = {
  id: 'plasma-button',
  name: 'Plasma Button',
  category: 'Inputs & Controls',
  description: 'Liquid glass plasma ampoule button with volumetric ionized gas comet, Snell’s Law raymarching, 6-band chromatic dispersion, and studio grid optics.',
  component: React.lazy(() => import('../../components/ui/plasma_button/PlasmaButton')),
  loadCode: () => import('../../components/ui/plasma_button/PlasmaButton.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/plasma_button/PlasmaButton.tsx?raw').then((m) => m.default),
      import('../../components/ui/plasma_button/plasmaButtonShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/plasma_button/PlasmaButton.css?raw').then((m) => m.default),
    ]);
    return {
      'PlasmaButton.tsx': tsx,
      'plasmaButtonShaders.ts': shaders,
      'PlasmaButton.css': css,
    };
  },
  getUsageCode: () => `import { PlasmaButton } from '@/components/ui/plasma_button/PlasmaButton';
import '@/components/ui/plasma_button/PlasmaButton.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full bg-black p-8">
      <PlasmaButton />
    </div>
  );
}`,
  cliCommand: 'npx atronix add plasma-button',
  hint: 'Click or drag the glass capsule to watch the volumetric plasma comet ignite and slide through the refractive glass ampoule!',
  hideHint: true,
};

export const plasmaToggle = plasmaButton;
export default plasmaButton;
