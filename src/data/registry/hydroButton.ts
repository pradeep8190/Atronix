import React from 'react';
import type { ComponentItem } from './types';

export const hydroButton: ComponentItem = {
  id: 'hydro-button',
  name: 'Hydro Button',
  category: 'Components',
  description: 'Incompressible hydrostatic water bag button. Features localized stone-drop indentation craters, volume-preserving outer border pressure bulges, and hydrodynamic capillary wave reflection.',
  component: React.lazy(() => import('../../components/ui/hydro_button/HydroButton')),
  footerComponent: React.lazy(() => import('../../components/ui/hydro_button/HydroButtonFooter')),
  loadCode: () => import('../../components/ui/hydro_button/HydroButton.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/hydro_button/HydroButton.tsx?raw').then((m) => m.default),
      import('../../components/ui/hydro_button/HydroButton.css?raw').then((m) => m.default),
    ]);
    return { 'HydroButton.tsx': tsx, 'HydroButton.css': css };
  },
  getUsageCode: () => `import { HydroButton } from '@/components/ui/hydro_button/HydroButton';
import '@/components/ui/hydro_button/HydroButton.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <HydroButton />
    </div>
  );
}`,
  colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add hydro-button',
  hint: 'Click anywhere on the capsule to drop a stone and watch the water displace!',
};

export default hydroButton;
