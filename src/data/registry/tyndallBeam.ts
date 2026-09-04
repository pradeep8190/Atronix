import React from 'react';
import type { ComponentItem } from './types';

export const tyndallBeam: ComponentItem = {
  id: 'tyndall-beam',
  name: 'Tyndall Beam',
  category: 'Components',
  description: 'Physical volumetric crepuscular light beam with suspended microscopic dust motes. Features directional Mie scattering, light-driven photon reflectance, 3D Brownian laminar drift, and single-draw-call WebGL architecture.',
  component: React.lazy(() => import('../../components/ui/tyndall_beam/TyndallBeam')),
  footerComponent: React.lazy(() => import('../../components/ui/tyndall_beam/TyndallBeamFooter')),
  loadCode: () => import('../../components/ui/tyndall_beam/TyndallBeam.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/tyndall_beam/TyndallBeam.tsx?raw').then((m) => m.default),
      import('../../components/ui/tyndall_beam/TyndallBeam.css?raw').then((m) => m.default),
    ]);
    return { 'TyndallBeam.tsx': tsx, 'TyndallBeam.css': css };
  },
  getUsageCode: () => `import { TyndallBeam } from '@/components/ui/tyndall_beam/TyndallBeam';
import '@/components/ui/tyndall_beam/TyndallBeam.css';

export default function HeroSection() {
  return (
    <div className="relative w-full h-[600px] bg-black overflow-hidden flex items-center justify-center">
      {/* Background Volumetric Light Beam */}
      <TyndallBeam
        theme="amber"
        particleCount={3800}
        dustSpeed={1.0}
        beamIntensity={1.0}
        className="absolute inset-0 w-full h-full"
      />

      {/* Your Hero Content */}
      <div className="relative z-10 text-white max-w-xl px-8">
        <h1 className="text-5xl font-medium tracking-tight">Build with clarity.</h1>
        <p className="mt-4 text-white/60">A modern UI component library engineered with physical realism.</p>
      </div>
    </div>
  );
}`,
  colorOptions: ['amber', 'black', 'blue', 'emerald', 'purple'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'amber',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add tyndall-beam',
  hint: 'Move cursor across the beam to observe physical fluid air currents and dust displacement!',
};

export default tyndallBeam;
