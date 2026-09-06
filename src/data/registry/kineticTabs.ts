import React from 'react';
import type { ComponentItem } from './types';

export const kineticTabs: ComponentItem = {
  id: 'kinetic-tabs',
  name: 'Kinetic Tabs',
  category: 'Navigation & Select',
  description: 'Apple-grade liquid glass optical floating tabs with viscoelastic jello spring mechanics, Snell’s Law chromatic dispersion, and protruding optical glass lens puck.',
  component: React.lazy(() => import('../../components/ui/kinetic_tabs/KineticTabs')),
  loadCode: () => import('../../components/ui/kinetic_tabs/KineticTabs.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/kinetic_tabs/KineticTabs.tsx?raw').then((m) => m.default),
      import('../../components/ui/kinetic_tabs/kineticTabsShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/kinetic_tabs/KineticTabs.css?raw').then((m) => m.default),
    ]);
    return {
      'KineticTabs.tsx': tsx,
      'kineticTabsShaders.ts': shaders,
      'KineticTabs.css': css,
    };
  },
  getUsageCode: () => `import { KineticTabs } from '@/components/ui/kinetic_tabs/KineticTabs';
import '@/components/ui/kinetic_tabs/KineticTabs.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[460px] w-full bg-black p-8">
      <KineticTabs />
    </div>
  );
}`,
  cliCommand: 'npx atronix add kinetic-tabs',
  hint: 'Click or drag between tabs to experience viscoelastic jello spring squash/stretch and 6-band chromatic dispersion!',
  hideHint: true,
};

export const liquidGlassNavbar = kineticTabs;
export default kineticTabs;
