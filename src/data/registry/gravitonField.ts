import React from 'react';
import type { ComponentItem } from './types';

export const gravitonField: ComponentItem = {
  id: 'graviton-field',
  name: 'Graviton Field',
  category: 'Components',
  description: '3D GPGPU relativistic particle field simulation with interactive raycaster momentum, harmonic simplex noise tori, and dual ping-pong render targets.',
  component: React.lazy(() => import('../../components/ui/graviton_field/GravitonField')),
  footerComponent: React.lazy(() => import('../../components/ui/graviton_field/GravitonFieldFooter')),
  loadCode: () => import('../../components/ui/graviton_field/GravitonField.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/graviton_field/GravitonField.tsx?raw').then((m) => m.default),
      import('../../components/ui/graviton_field/GravitonField.css?raw').then((m) => m.default),
    ]);
    return {
      'GravitonField.tsx': tsx,
      'GravitonField.css': css,
    };
  },
  getUsageCode: () => `import { GravitonField } from '@/components/ui/graviton_field/GravitonField';
import '@/components/ui/graviton_field/GravitonField.css';

export default function Example() {
  return (
    <div className="relative w-full h-[520px] bg-black rounded-2xl overflow-hidden">
      <GravitonField
        theme="dark"
        density={220}
        particlesScale={0.65}
        color1="#818cf8"
        color2="#c084fc"
        color3="#475569"
      />
    </div>
  );
}`,
  colorOptions: ['purple', 'black'],
  sizeOptions: ['md'],
  defaultColor: 'purple',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add graviton-field',
  hideHint: true,
  cliOnly: true,
  cliOnlyReason: 'Graviton Field requires the dedicated 3D GPGPU WebGL engine (engine/). Manual copy-paste will miss the physics simulation files. Please install via CLI.',
};

export default gravitonField;
