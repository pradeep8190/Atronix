import React from 'react';
import type { ComponentItem } from './types';

export const phaseToggle: ComponentItem = {
  id: 'phase-toggle',
  name: 'Phase Toggle',
  category: 'Components',
  description: 'Cross-browser liquid goo toggle with tap and drag physics. Features dual-stage SVG knockout filtering, velocity-stretched bubble elongation, and linear spring recoil.',
  component: React.lazy(() => import('../../components/ui/phase_toggle/PhaseToggle')),
  footerComponent: React.lazy(() => import('../../components/ui/phase_toggle/PhaseToggleFooter')),
  loadCode: () => import('../../components/ui/phase_toggle/PhaseToggle.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/phase_toggle/PhaseToggle.tsx?raw').then((m) => m.default),
      import('../../components/ui/phase_toggle/PhaseToggle.css?raw').then((m) => m.default),
    ]);
    return { 'PhaseToggle.tsx': tsx, 'PhaseToggle.css': css };
  },
  getUsageCode: () => `import { PhaseToggle } from '@/components/ui/phase_toggle/PhaseToggle';
import '@/components/ui/phase_toggle/PhaseToggle.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <PhaseToggle />
    </div>
  );
}`,
  colorOptions: ['black', 'white', 'emerald', 'blue', 'purple', 'amber'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add phase-toggle',
  hint: 'Tap to toggle or click and drag the liquid droplet across the track!',
};

export default phaseToggle;
