import React from 'react';
import type { ComponentItem } from './types';

export const mercurySlider: ComponentItem = {
  id: 'mercury-slider',
  name: 'Mercury Slider',
  category: 'Components',
  description: 'Hydrodynamic liquid mercury bead slider in an optical frosted glass channel. Features Poisson volume-preserving stretch, viscous surface drag, and rubberized elastic overdrag recoil.',
  component: React.lazy(() => import('../../components/ui/mercury_slider/MercurySlider')),
  footerComponent: React.lazy(() => import('../../components/ui/mercury_slider/MercurySliderFooter')),
  loadCode: () => import('../../components/ui/mercury_slider/MercurySlider.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/mercury_slider/MercurySlider.tsx?raw').then((m) => m.default),
      import('../../components/ui/mercury_slider/MercurySlider.css?raw').then((m) => m.default),
    ]);
    return { 'MercurySlider.tsx': tsx, 'MercurySlider.css': css };
  },
  getUsageCode: () => `import { MercurySlider } from '@/components/ui/mercury_slider/MercurySlider';
import '@/components/ui/mercury_slider/MercurySlider.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <MercurySlider />
    </div>
  );
}`,
  colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add mercury-slider',
  hint: 'Drag the liquid mercury bead along the frosted glass channel!',
};

export default mercurySlider;
