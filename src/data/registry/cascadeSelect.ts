import React from 'react';
import type { ComponentItem } from './types';

export const cascadeSelect: ComponentItem = {
  id: 'cascade-select',
  name: 'Cascade Select',
  category: 'Components',
  description: 'GPU-accelerated WebGL fluid cascade dropdown. Features gravity-driven meniscus stretching, Inigo Quilez smooth minimum fusion, damped harmonic recoil kinematics, and frosted liquid glass optics.',
  component: React.lazy(() => import('../../components/ui/cascade_select/CascadeSelect')),
  footerComponent: React.lazy(() => import('../../components/ui/cascade_select/CascadeSelectFooter')),
  loadCode: () => import('../../components/ui/cascade_select/CascadeSelect.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/cascade_select/CascadeSelect.tsx?raw').then((m) => m.default),
      import('../../components/ui/cascade_select/CascadeSelect.css?raw').then((m) => m.default),
    ]);
    return { 'CascadeSelect.tsx': tsx, 'CascadeSelect.css': css };
  },
  getUsageCode: () => `import { CascadeSelect } from '@/components/ui/cascade_select/CascadeSelect';
import '@/components/ui/cascade_select/CascadeSelect.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <CascadeSelect />
    </div>
  );
}`,
  colorOptions: ['black', 'blue', 'purple', 'emerald'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add cascade-select',
  hint: 'Click the trigger button to release the WebGL liquid cascade!',
};

export default cascadeSelect;
