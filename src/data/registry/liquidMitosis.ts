import React from 'react';
import type { ComponentItem } from './types';

export const liquidMitosis: ComponentItem = {
  id: 'liquid-mitosis',
  name: 'Liquid Mitosis',
  category: 'Components',
  description: 'GPU-accelerated WebGL Signed Distance Field (SDF) fluid mitosis button. Features Inigo Quilez C1-smooth metaball fusion, Rayleigh-Plateau capillary pinch-off physics, and Atronix signature optical liquid glass caustics.',
  component: React.lazy(() => import('../../components/ui/liquid_mitosis/LiquidMitosis')),
  footerComponent: React.lazy(() => import('../../components/ui/liquid_mitosis/LiquidMitosisFooter')),
  loadCode: () => import('../../components/ui/liquid_mitosis/LiquidMitosis.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/liquid_mitosis/LiquidMitosis.tsx?raw').then((m) => m.default),
      import('../../components/ui/liquid_mitosis/LiquidMitosis.css?raw').then((m) => m.default),
    ]);
    return { 'LiquidMitosis.tsx': tsx, 'LiquidMitosis.css': css };
  },
  getUsageCode: () => `import { LiquidMitosis } from '@/components/ui/liquid_mitosis/LiquidMitosis';
import '@/components/ui/liquid_mitosis/LiquidMitosis.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <LiquidMitosis
        primaryText="Quantum Engine"
        secondaryText="Launch"
        color="black"
      />
    </div>
  );
}`,
  colorOptions: ['black', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add liquid-mitosis',
  hint: 'Hover over the capsule to trigger GPU fluid mitosis and capillary separation!',
};

export default liquidMitosis;
