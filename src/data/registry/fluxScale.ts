import React from 'react';
import type { ComponentItem } from './types';

export const fluxScale: ComponentItem = {
  id: 'flux-scale',
  name: 'Flux Scale',
  category: 'Components',
  description: 'Luxury comparison pricing matrix with 14-stop optical radial gradients, 7-stop specular hairlines, tabular typography, and zero layout shift.',
  component: React.lazy(() => import('../../components/ui/flux_scale/FluxScale')),
  footerComponent: React.lazy(() => import('../../components/ui/flux_scale/FluxScaleFooter')),
  loadCode: () => import('../../components/ui/flux_scale/FluxScale.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/flux_scale/FluxScale.tsx?raw').then((m) => m.default),
      import('../../components/ui/flux_scale/FluxScale.css?raw').then((m) => m.default),
    ]);
    return {
      'FluxScale.tsx': tsx,
      'FluxScale.css': css,
    };
  },
  getUsageCode: () => `import { FluxScale } from '@/components/ui/flux_scale/FluxScale';
import '@/components/ui/flux_scale/FluxScale.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[580px] w-full bg-black p-8">
      <FluxScale
        legacyCard={{ price: 888 }}
        proCard={{ price: 204 }}
      />
    </div>
  );
}`,
  colorOptions: ['purple', 'black'],
  sizeOptions: ['md'],
  defaultColor: 'purple',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add flux-scale',
  hint: 'Hover over the cards to see the 7-stop specular hairlines expand and catch optical reflections!',
};

export default fluxScale;
