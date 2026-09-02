import React from 'react';
import Folder from '../components/ui/frost_vault/Folder';
import FolderFooter from '../components/ui/frost_vault/FolderFooter';
import folderCode from '../components/ui/frost_vault/Folder.tsx?raw';
import LiquidMitosis from '../components/ui/liquid_mitosis/LiquidMitosis';
import LiquidMitosisFooter from '../components/ui/liquid_mitosis/LiquidMitosisFooter';
import liquidMitosisCode from '../components/ui/liquid_mitosis/LiquidMitosis.tsx?raw';
import CascadeSelect from '../components/ui/cascade_select/CascadeSelect';
import CascadeSelectFooter from '../components/ui/cascade_select/CascadeSelectFooter';
import cascadeSelectCode from '../components/ui/cascade_select/CascadeSelect.tsx?raw';
import MercurySlider from '../components/ui/mercury_slider/MercurySlider';
import MercurySliderFooter from '../components/ui/mercury_slider/MercurySliderFooter';
import mercurySliderCode from '../components/ui/mercury_slider/MercurySlider.tsx?raw';
import PhaseToggle from '../components/ui/phase_toggle/PhaseToggle';
import PhaseToggleFooter from '../components/ui/phase_toggle/PhaseToggleFooter';
import phaseToggleCode from '../components/ui/phase_toggle/PhaseToggle.tsx?raw';
import HydroButton from '../components/ui/hydro_button/HydroButton';
import HydroButtonFooter from '../components/ui/hydro_button/HydroButtonFooter';
import hydroButtonCode from '../components/ui/hydro_button/HydroButton.tsx?raw';
import FlowingTabs from '../components/ui/flowing_tabs/FlowingTabs';
import FlowingTabsFooter from '../components/ui/flowing_tabs/FlowingTabsFooter';
import flowingTabsCode from '../components/ui/flowing_tabs/FlowingTabs.tsx?raw';
import AeroCore from '../components/ui/aero_core/AeroCore';
import AeroCoreFooter from '../components/ui/aero_core/AeroCoreFooter';
import aeroCoreCode from '../components/ui/aero_core/AeroCore.tsx?raw';

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  component: React.ComponentType<any>;
  footerComponent?: React.ComponentType<any>;
  code: string;
  colorOptions?: string[];
  sizeOptions?: string[];
  defaultColor?: string;
  defaultSize?: string;
  dependencies?: string[];
  cliCommand?: string;
  hint?: string;
}

export const componentsRegistry: Record<string, ComponentItem> = {
  'frost-vault': {
    id: 'frost-vault',
    name: 'Frost Vault',
    category: 'Components',
    description: 'An interactive 3D glass folder component featuring animated card reveals, customizable color themes, spring dynamics, and responsive scale options.',
    component: Folder,
    footerComponent: FolderFooter,
    code: folderCode,
    colorOptions: ['black', 'white', 'blue'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add frost-vault',
    hint: 'Hover & click on the folder vault to open/close cards!',
  },
  'liquid-mitosis': {
    id: 'liquid-mitosis',
    name: 'Liquid Mitosis',
    category: 'Components',
    description: 'GPU-accelerated WebGL Signed Distance Field (SDF) fluid mitosis button. Features Inigo Quilez C1-smooth metaball fusion, Rayleigh-Plateau capillary pinch-off physics, and Atronix signature optical liquid glass caustics.',
    component: LiquidMitosis,
    footerComponent: LiquidMitosisFooter,
    code: liquidMitosisCode,
    colorOptions: ['black', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add liquid-mitosis',
    hint: 'Hover over the capsule to trigger GPU fluid mitosis and capillary separation!',
  },
  'cascade-select': {
    id: 'cascade-select',
    name: 'Cascade Select',
    category: 'Components',
    description: 'GPU-accelerated WebGL fluid cascade dropdown. Features gravity-driven meniscus stretching, Inigo Quilez smooth minimum fusion, damped harmonic recoil kinematics, and frosted liquid glass optics.',
    component: CascadeSelect,
    footerComponent: CascadeSelectFooter,
    code: cascadeSelectCode,
    colorOptions: ['black', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add cascade-select',
    hint: 'Click the trigger button to release the WebGL liquid cascade!',
  },
  'mercury-slider': {
    id: 'mercury-slider',
    name: 'Mercury Slider',
    category: 'Components',
    description: 'Hydrodynamic liquid mercury bead slider in an optical frosted glass channel. Features Poisson volume-preserving stretch, viscous surface drag, and rubberized elastic overdrag recoil.',
    component: MercurySlider,
    footerComponent: MercurySliderFooter,
    code: mercurySliderCode,
    colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add mercury-slider',
    hint: 'Drag the liquid mercury bead along the frosted glass channel!',
  },
  'phase-toggle': {
    id: 'phase-toggle',
    name: 'Phase Toggle',
    category: 'Components',
    description: 'Kinetic mercury switch inside a dual-chamber optical frosted glass vessel. Features high-speed capillary throat squirt kinematics, directional 3D liquid metal glints, and impact fluid wave dispersion.',
    component: PhaseToggle,
    footerComponent: PhaseToggleFooter,
    code: phaseToggleCode,
    colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add phase-toggle',
    hint: 'Click to squirt the liquid mercury bead through the capillary throat!',
  },
  'hydro-button': {
    id: 'hydro-button',
    name: 'Hydro Button',
    category: 'Components',
    description: 'Incompressible hydrostatic water bag button. Features localized stone-drop indentation craters, volume-preserving outer border pressure bulges, and hydrodynamic capillary wave reflection.',
    component: HydroButton,
    footerComponent: HydroButtonFooter,
    code: hydroButtonCode,
    colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add hydro-button',
    hint: 'Click anywhere on the capsule to drop a stone and watch the water displace!',
  },
  'flowing-tabs': {
    id: 'flowing-tabs',
    name: 'Flowing Tab',
    category: 'Components',
    description: 'Hydraulic multi-chamber fluid switcher. Models real water surge dynamics: viscous floor creep leading the flow, wave cresting through the sluice gate, and slosh resonance upon chamber impact.',
    component: FlowingTabs,
    footerComponent: FlowingTabsFooter,
    code: flowingTabsCode,
    colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add flowing-tabs',
    hint: 'Switch between Preview and Code to watch the water creep, roll, and slosh across the gate!',
  },
  'aero-core': {
    id: 'aero-core',
    name: 'Aero Core',
    category: 'Components',
    description: 'Voice-reactive volumetric smoke and celestial nebula orb. Features 5-octave rotational FBM domain warping, acoustic speech billowing, radiant luminous core pulses, and interactive pointer smoke stirring.',
    component: AeroCore,
    footerComponent: AeroCoreFooter,
    code: aeroCoreCode,
    colorOptions: ['black', 'amber', 'blue', 'purple', 'emerald'],
    sizeOptions: ['sm', 'md', 'lg'],
    defaultColor: 'black',
    defaultSize: 'md',
    dependencies: ['motion'],
    cliCommand: 'npx atronix add aero-core',
    hint: 'Move cursor to stir the smoke wisps, or speak to watch the luminous cloud billow and pulse!',
  },
};

export default componentsRegistry;

