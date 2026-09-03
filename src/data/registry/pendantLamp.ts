import React from 'react';
import type { ComponentItem } from './types';

export const pendantLamp: ComponentItem = {
  id: 'pendant-lamp',
  name: 'Pendant Lamp',
  category: 'Components',
  description: 'Industrial suspended pendant lamp with physical inverse-square cone beam lighting, specular dome fixture, cast shadow floor physics, and illuminated typographic reveal.',
  component: React.lazy(() => import('../../components/ui/pendant_lamp/PendantLamp')),
  footerComponent: React.lazy(() => import('../../components/ui/pendant_lamp/PendantLampFooter')),
  loadCode: () => import('../../components/ui/pendant_lamp/PendantLamp.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/pendant_lamp/PendantLamp.tsx?raw').then((m) => m.default),
      import('../../components/ui/pendant_lamp/PendantLamp.css?raw').then((m) => m.default),
    ]);
    return { 'PendantLamp.tsx': tsx, 'PendantLamp.css': css };
  },
  getUsageCode: () => `import { PendantLamp } from '@/components/ui/pendant_lamp/PendantLamp';
import '@/components/ui/pendant_lamp/PendantLamp.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <PendantLamp />
    </div>
  );
}`,
  colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add pendant-lamp',
  hint: 'Click the lamp fixture or pull the bead string to toggle the volumetric light beam!',
};

export default pendantLamp;
