import React from 'react';
import type { ComponentItem } from './types';

export const eclipseSwitch: ComponentItem = {
  id: 'eclipse-switch',
  name: 'Eclipse Switch',
  category: 'Inputs & Controls',
  description: 'Pure WebGL celestial day-night liquid glass switch with wave meniscus refraction, Snell’s Law raymarching, capillary ripple dynamics, and 3D pill track.',
  component: React.lazy(() => import('../../components/ui/eclipse_switch/EclipseSwitch')),
  loadCode: () => import('../../components/ui/eclipse_switch/EclipseSwitch.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/eclipse_switch/EclipseSwitch.tsx?raw').then((m) => m.default),
      import('../../components/ui/eclipse_switch/eclipseSwitchShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/eclipse_switch/EclipseSwitch.css?raw').then((m) => m.default),
    ]);
    return {
      'EclipseSwitch.tsx': tsx,
      'eclipseSwitchShaders.ts': shaders,
      'EclipseSwitch.css': css,
    };
  },
  getUsageCode: () => `import { EclipseSwitch } from '@/components/ui/eclipse_switch/EclipseSwitch';
import '@/components/ui/eclipse_switch/EclipseSwitch.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full bg-black p-8">
      <EclipseSwitch />
    </div>
  );
}`,
  cliCommand: 'npx atronix add eclipse-switch',
  hint: 'Click the switch to trigger Snell’s Law liquid glass refraction and toggle light & dark mode!',
  hideHint: true,
};

export const themeChange = eclipseSwitch;
export default eclipseSwitch;
