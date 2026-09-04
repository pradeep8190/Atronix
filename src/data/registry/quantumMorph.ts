import React from 'react';
import type { ComponentItem } from './types';

export const quantumMorph: ComponentItem = {
  id: 'quantum-morph',
  name: 'Quantum Morph',
  category: 'Components',
  description: '3D GPGPU particle lattice that morphs between atmospheric Brownian drift and structured developer { } code brackets on hover.',
  component: React.lazy(() => import('../../components/ui/quantum_morph/QuantumMorph')),
  footerComponent: React.lazy(() => import('../../components/ui/quantum_morph/QuantumMorphFooter')),
  loadCode: () => import('../../components/ui/quantum_morph/QuantumMorph.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/quantum_morph/QuantumMorph.tsx?raw').then((m) => m.default),
      import('../../components/ui/quantum_morph/QuantumMorph.css?raw').then((m) => m.default),
    ]);
    return {
      'QuantumMorph.tsx': tsx,
      'QuantumMorph.css': css,
    };
  },
  getUsageCode: () => `import { QuantumMorph } from '@/components/ui/quantum_morph/QuantumMorph';
import '@/components/ui/quantum_morph/QuantumMorph.css';

export default function Example() {
  return (
    <div className="relative w-full max-w-xl mx-auto min-h-[540px] rounded-2xl overflow-hidden">
      <QuantumMorph
        theme="light"
        density={50}
        particlesScale={0.6}
        cameraZoom={8.8}
        texture="/assets/textures/icons/individual.png"
        color1="#676A72"
        color2="#475569"
        color3="#334155"
        badgeText="Atronix Sovereign Engine"
        headline="Physical Interface Dynamics"
        subheadline="Interactive 3D particle lattice with fluid code morphing"
        buttonText="Explore Components"
        buttonIcon="code"
      />
    </div>
  );
}`,
  colorOptions: ['light', 'dark'],
  sizeOptions: ['md'],
  defaultColor: 'light',
  defaultSize: 'md',
  defaultProps: {
    theme: 'light',
    density: 50,
    particlesScale: 0.6,
    cameraZoom: 8.8,
    texture: '/assets/textures/icons/individual.png',
    color1: '#676A72',
    color2: '#475569',
    color3: '#334155',
    badgeText: 'Atronix Sovereign Engine',
    headline: 'Physical Interface Dynamics',
    subheadline: 'Interactive 3D particle lattice with fluid code morphing',
    buttonText: 'Explore Components',
    buttonIcon: 'code',
  },
  dependencies: [],
  cliCommand: 'npx atronix add quantum-morph',
  hideHint: true,
  cliOnly: true,
  cliOnlyReason: 'Quantum Morph requires the dedicated 3D GPGPU WebGL engine (engine/) and icon textures. Manual copy-paste will miss the physics simulation files. Please install via CLI.',
};

export default quantumMorph;
