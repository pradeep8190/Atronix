import type { ComponentItem } from './registry/types';
import { frostVault } from './registry/frostVault';
import { gravitonField } from './registry/gravitonField';
import { quantumMorph } from './registry/quantumMorph';
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
import { tyndallBeam } from './registry/tyndallBeam';
import { eclipseSwitch } from './registry/eclipseSwitch';
import { silicaSlider } from './registry/silicaSlider';
import { lensStrip } from './registry/lensStrip';
import { opticDeck } from './registry/opticDeck';
import { kineticTabs } from './registry/kineticTabs';
import { plasmaButton } from './registry/plasmaButton';
import { atmosphereCard } from './registry/atmosphereCard';
export * from './registry/types';

export const componentsRegistry: Record<string, ComponentItem> = {
  'frost-vault': frostVault,
  'graviton-field': gravitonField,
  'quantum-morph': quantumMorph,
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
  'tyndall-beam': tyndallBeam,
  'eclipse-switch': eclipseSwitch,
  'theme-change': eclipseSwitch,
  'silica-slider': silicaSlider,
  'liquid-glass-slider': silicaSlider,
  'lens-strip': lensStrip,
  'camera-roll': lensStrip,
  'optic-deck': opticDeck,
  'liquid-glass-button': opticDeck,
  'kinetic-tabs': kineticTabs,
  'liquid-glass-navbar': kineticTabs,
  'plasma-button': plasmaButton,
  'plasma-toggle': plasmaButton,
  'atmosphere-card': atmosphereCard,
  'climate-weather': atmosphereCard,
};

export default componentsRegistry;
