import type { ComponentItem } from './registry/types';
import { frostVault } from './registry/frostVault';
import { liquidMitosis } from './registry/liquidMitosis';
import { cascadeSelect } from './registry/cascadeSelect';
import { mercurySlider } from './registry/mercurySlider';
import { phaseToggle } from './registry/phaseToggle';
import { hydroButton } from './registry/hydroButton';
import { aeroCore } from './registry/aeroCore';
import { ferroDrop } from './registry/ferroDrop';
import { pendantLamp } from './registry/pendantLamp';
import { orbitGlobe } from './registry/orbitGlobe';
import { speedRays } from './registry/speedRays';

export * from './registry/types';

export const componentsRegistry: Record<string, ComponentItem> = {
  'frost-vault': frostVault,
  'liquid-mitosis': liquidMitosis,
  'cascade-select': cascadeSelect,
  'mercury-slider': mercurySlider,
  'phase-toggle': phaseToggle,
  'hydro-button': hydroButton,
  'aero-core': aeroCore,
  'ferro-drop': ferroDrop,
  'pendant-lamp': pendantLamp,
  'orbit-globe': orbitGlobe,
  'speed-rays': speedRays,
};

export default componentsRegistry;
