import React from 'react';
import type { ComponentItem } from './types';

export const speedRays: ComponentItem = {
  id: 'speed-rays',
  name: 'Speed Rays',
  category: 'Components',
  description: 'GPU-accelerated relativistic velocity field. Features high-velocity tapered photon laser streaks, hardware compositor transforms, pre-warmed negative phase offsets, and optical vignette framing.',
  component: React.lazy(() => import('../../components/ui/speed_rays/SpeedRays')),
  footerComponent: React.lazy(() => import('../../components/ui/speed_rays/SpeedRaysFooter')),
  loadCode: () => import('../../components/ui/speed_rays/SpeedRays.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/speed_rays/SpeedRays.tsx?raw').then((m) => m.default),
      import('../../components/ui/speed_rays/SpeedRays.css?raw').then((m) => m.default),
    ]);
    return { 'SpeedRays.tsx': tsx, 'SpeedRays.css': css };
  },
  getUsageCode: () => `import { SpeedRays } from '@/components/ui/speed_rays/SpeedRays';
import '@/components/ui/speed_rays/SpeedRays.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <SpeedRays />
    </div>
  );
}`,
  colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add speed-rays',
  hint: 'Watch the 120 FPS relativistic laser streaks stream across the physical canvas in real time!',
};

export default speedRays;
