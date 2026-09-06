import React from 'react';
import type { ComponentItem } from './types';

export const atmosphereCard: ComponentItem = {
  id: 'atmosphere-card',
  name: 'Atmosphere Card',
  category: 'Surfaces & Cards',
  description: 'Liquid glass real-time weather controller with split-digit rolling odometer, 24-hour timeline scrubber, procedural molten silk background refraction, Snell’s Law ray bending, and 6-band chromatic dispersion.',
  component: React.lazy(() => import('../../components/ui/atmosphere_card/AtmosphereCard')),
  loadCode: () => import('../../components/ui/atmosphere_card/AtmosphereCard.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/atmosphere_card/AtmosphereCard.tsx?raw').then((m) => m.default),
      import('../../components/ui/atmosphere_card/atmosphereCardShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/atmosphere_card/AtmosphereCard.css?raw').then((m) => m.default),
    ]);
    return {
      'AtmosphereCard.tsx': tsx,
      'atmosphereCardShaders.ts': shaders,
      'AtmosphereCard.css': css,
    };
  },
  getUsageCode: () => `import { AtmosphereCard } from '@/components/ui/atmosphere_card/AtmosphereCard';
import '@/components/ui/atmosphere_card/AtmosphereCard.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full bg-black p-8">
      <AtmosphereCard />
    </div>
  );
}`,
  cliCommand: 'npx atronix add atmosphere-card',
  hint: 'Drag the 24-hour timeline scrubber or click the °C/°F unit switch to watch the split-digit odometer roll through molten silk refractions!',
  hideHint: true,
};

export const climateWeather = atmosphereCard;
export default atmosphereCard;
