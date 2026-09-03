import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uiDir = path.join(rootDir, 'src', 'components', 'ui');
const outputDir = path.join(rootDir, 'public', 'r');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Map directory names to component metadata
const componentMeta = {
  orbit_globe: {
    id: 'orbit-globe',
    name: 'Orbit Globe',
    description: '3D interactive wireframe orbital globe with Natural Earth vector coastlines and momentum drag physics.',
    dependencies: [],
  },
  pendant_lamp: {
    id: 'pendant-lamp',
    name: 'Pendant Lamp',
    description: 'Suspended industrial pendant lamp with volumetric inverse-square light cone and physical pendulum sway.',
    dependencies: ['motion'],
  },
  aero_core: {
    id: 'aero-core',
    name: 'Aero Core',
    description: 'Acoustic-reactive volumetric smoke nebula orb with 5-octave rotational FBM domain warping.',
    dependencies: ['motion'],
  },
  liquid_mitosis: {
    id: 'liquid-mitosis',
    name: 'Liquid Mitosis',
    description: 'Hydrodynamic fluid metaball button with Rayleigh-Plateau droplet separation kinematics.',
    dependencies: ['motion'],
  },
  frost_vault: {
    id: 'frost-vault',
    name: 'Frost Vault',
    description: '3D optical glass expanding cards with real refractive Fresnel blur and depth stacking.',
    dependencies: ['motion'],
  },
  cascade_select: {
    id: 'cascade-select',
    name: 'Cascade Select',
    description: 'Gravity-driven optical liquid glass dropdown selector with viscoelastic drip easing.',
    dependencies: ['motion'],
  },
  phase_toggle: {
    id: 'phase-toggle',
    name: 'Phase Toggle',
    description: 'Dual-chamber optical liquid mercury switch with capillary throat squirt kinematics.',
    dependencies: ['motion'],
  },
  hydro_button: {
    id: 'hydro-button',
    name: 'Hydro Button',
    description: 'Incompressible hydrostatic water bag button with stone-drop crater depression and border bulge.',
    dependencies: ['motion'],
  },
  ferro_drop: {
    id: 'ferro-drop',
    name: 'Ferro Drop',
    description: 'Magnetic AI prompt bar with ferrofluid boundary pull and particle assimilation.',
    dependencies: ['motion'],
  },
  mercury_slider: {
    id: 'mercury-slider',
    name: 'Mercury Slider',
    description: 'Hydrodynamic liquid mercury bead slider with Poisson volume stretch physics.',
    dependencies: ['motion'],
  },
  speed_rays: {
    id: 'speed-rays',
    name: 'Speed Rays',
    description: 'GPU-accelerated relativistic velocity field with tapered photon laser streaks.',
    dependencies: [],
  },
};

const registryIndex = [];

// Scan ui directory
const dirs = fs.readdirSync(uiDir, { withFileTypes: true });

for (const dir of dirs) {
  if (!dir.isDirectory()) continue;
  const folderName = dir.name;
  const meta = componentMeta[folderName];
  if (!meta) continue;

  const folderPath = path.join(uiDir, folderName);
  const files = fs.readdirSync(folderPath);

  const registryFiles = [];

  for (const fileName of files) {
    // Skip footer doc components in the standalone export
    if (fileName.includes('Footer')) continue;
    if (fileName.endsWith('.test.ts') || fileName.endsWith('.test.tsx')) continue;

    const filePath = path.join(folderPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    registryFiles.push({
      path: `components/ui/${fileName}`,
      content: content,
      type: 'registry:ui',
      target: `components/ui/${fileName}`,
    });
  }

  const registryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: meta.id,
    type: 'registry:ui',
    title: meta.name,
    description: meta.description,
    dependencies: meta.dependencies || [],
    files: registryFiles,
  };

  // Write individual component JSON (e.g. public/r/orbit-globe.json)
  const itemPath = path.join(outputDir, `${meta.id}.json`);
  fs.writeFileSync(itemPath, JSON.stringify(registryItem, null, 2), 'utf-8');

  registryIndex.push({
    name: meta.id,
    title: meta.name,
    description: meta.description,
    dependencies: meta.dependencies,
  });

  console.log(`[Registry] Generated public/r/${meta.id}.json`);
}

// Write master index (public/r/index.json)
fs.writeFileSync(
  path.join(outputDir, 'index.json'),
  JSON.stringify(registryIndex, null, 2),
  'utf-8'
);

console.log(`[Registry] Master index generated with ${registryIndex.length} components.`);
