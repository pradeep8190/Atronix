import React from 'react';
import type { ComponentItem } from './types';

export const opticDeck: ComponentItem = {
  id: 'optic-deck',
  name: 'Optic Deck',
  category: 'Inputs & Controls',
  description: 'Apple-grade optical glass action deck with hydraulic unfolding card kinematics, Snell’s Law raymarching, 6-band chromatic dispersion, and fluid hover glider.',
  component: React.lazy(() => import('../../components/ui/optic_deck/OpticDeck')),
  loadCode: () => import('../../components/ui/optic_deck/OpticDeck.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, shaders, css] = await Promise.all([
      import('../../components/ui/optic_deck/OpticDeck.tsx?raw').then((m) => m.default),
      import('../../components/ui/optic_deck/opticDeckShaders.ts?raw').then((m) => m.default),
      import('../../components/ui/optic_deck/OpticDeck.css?raw').then((m) => m.default),
    ]);
    return {
      'OpticDeck.tsx': tsx,
      'opticDeckShaders.ts': shaders,
      'OpticDeck.css': css,
    };
  },
  getUsageCode: () => `import { OpticDeck } from '@/components/ui/optic_deck/OpticDeck';
import '@/components/ui/optic_deck/OpticDeck.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full bg-black p-8">
      <OpticDeck />
    </div>
  );
}`,
  cliCommand: 'npx atronix add optic-deck',
  hint: 'Click the plus button in the bottom corner to unfold the optical action deck!',
  hideHint: true,
};

export const liquidGlassButton = opticDeck;
export default opticDeck;
