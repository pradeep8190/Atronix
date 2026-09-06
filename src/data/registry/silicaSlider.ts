import React from 'react';
import type { ComponentItem } from './types';

export const silicaSlider: ComponentItem = {
  id: 'silica-slider',
  name: 'Silica Slider',
  category: 'Inputs & Controls',
  description: 'Pixel-accurate optical silica glass slider with Snell’s Law refraction, 6-band chromatic dispersion, split meniscus caustics, and balanced harmonic jelly physics.',
  component: React.lazy(() => import('../../components/ui/silica_slider/SilicaSlider')),
  loadCode: () => import('../../components/ui/silica_slider/SilicaSlider.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/silica_slider/SilicaSlider.tsx?raw').then((m) => m.default),
      import('../../components/ui/silica_slider/silicaSliderShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/silica_slider/SilicaSlider.css?raw').then((m) => m.default),
    ]);
    return {
      'SilicaSlider.tsx': tsx,
      'silicaSliderShaders.ts': shaders,
      'SilicaSlider.css': css,
    };
  },
  getUsageCode: () => `import { SilicaSlider } from '@/components/ui/silica_slider/SilicaSlider';
import '@/components/ui/silica_slider/SilicaSlider.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[450px] w-full bg-[#f8fafc] p-8">
      <SilicaSlider defaultValue={72} />
    </div>
  );
}`,
  cliCommand: 'npx atronix add silica-slider',
  hideHint: true,
};

export const liquidGlassSlider = silicaSlider;
export default silicaSlider;
