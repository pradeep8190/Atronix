import React from 'react';
import type { ComponentItem } from './types';

export const lensStrip: ComponentItem = {
  id: 'lens-strip',
  name: 'Lens Strip',
  category: 'Navigation & Select',
  description: 'Apple-grade optical glass mode selector with stationary magnifying lens, Snell’s Law chromatic dispersion, and buttery inertial glide.',
  component: React.lazy(() => import('../../components/ui/lens_strip/LensStrip')),
  loadCode: () => import('../../components/ui/lens_strip/LensStrip.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/lens_strip/LensStrip.tsx?raw').then((m) => m.default),
      import('../../components/ui/lens_strip/lensStripShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/lens_strip/LensStrip.css?raw').then((m) => m.default),
    ]);
    return {
      'LensStrip.tsx': tsx,
      'lensStripShaders.ts': shaders,
      'LensStrip.css': css,
    };
  },
  getUsageCode: () => `import { LensStrip } from '@/components/ui/lens_strip/LensStrip';
import '@/components/ui/lens_strip/LensStrip.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[460px] w-full bg-black p-8">
      <LensStrip />
    </div>
  );
}`,
  cliCommand: 'npx atronix add lens-strip',
  hint: 'Swipe or drag the resolution strip horizontally through the stationary optical glass lens!',
  hideHint: true,
};

export const cameraRoll = lensStrip;
export default lensStrip;
