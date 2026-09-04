import React from 'react';
import type { ComponentItem } from './registry/types';

export interface TemplateItem extends ComponentItem {
  templateCategory?: 'testimonials' | 'footers' | 'features' | 'pricing' | 'heroes';
}

export const testimonialsTemplate: TemplateItem = {
  id: 'testimonials',
  name: 'Decentralized Testimonials',
  category: 'Templates',
  templateCategory: 'testimonials',
  description: '3D curved perspective horizontal infinite scroll testimonials deck with obsidian glass cards, corner brackets, and volumetric lighting.',
  component: React.lazy(() => import('../templates/testimonials/Testimonials')),
  footerComponent: React.lazy(() => import('../templates/testimonials/TestimonialsFooter')),
  loadCode: () => import('../templates/testimonials/Testimonials.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../templates/testimonials/Testimonials.tsx?raw').then((m) => m.default),
      import('../templates/testimonials/Testimonials.css?raw').then((m) => m.default),
    ]);
    return {
      'Testimonials.tsx': tsx,
      'Testimonials.css': css,
    };
  },
  getUsageCode: () => `import { Testimonials } from '@/templates/testimonials/Testimonials';
import '@/templates/testimonials/Testimonials.css';

export default function Example() {
  return (
    <div className="w-full bg-black min-h-screen">
      <Testimonials
        tagline="Verified Telemetry"
        title="Decentralized Testimonials."
        subtitle="What developers, design engineers, and creative technologists say after deploying Atronix UI into mission-critical production interfaces."
      />
    </div>
  );
}`,
  colorOptions: ['black'],
  sizeOptions: ['full'],
  defaultColor: 'black',
  defaultSize: 'full',
  defaultProps: {
    tagline: 'Verified Telemetry',
    title: 'Decentralized Testimonials.',
    subtitle: 'What developers, design engineers, and creative technologists say after deploying Atronix UI into mission-critical production interfaces.',
    speed: 1.4,
  },
  dependencies: [],
  cliCommand: 'npx atronix add testimonials',
};

export const specularTierTemplate: TemplateItem = {
  id: 'specular-tier',
  name: 'Specular Tier',
  category: 'Templates',
  templateCategory: 'pricing',
  description: 'Luxury comparison pricing matrix with 14-stop optical radial gradients, 7-stop specular hairlines, and tabular typography.',
  component: React.lazy(() => import('../templates/specular_tier/SpecularTier')),
  footerComponent: React.lazy(() => import('../templates/specular_tier/SpecularTierFooter')),
  loadCode: () => import('../templates/specular_tier/SpecularTier.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../templates/specular_tier/SpecularTier.tsx?raw').then((m) => m.default),
      import('../templates/specular_tier/SpecularTier.css?raw').then((m) => m.default),
    ]);
    return {
      'SpecularTier.tsx': tsx,
      'SpecularTier.css': css,
    };
  },
  getUsageCode: () => `import { SpecularTier } from '@/templates/specular_tier/SpecularTier';
import '@/templates/specular_tier/SpecularTier.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[580px] w-full bg-black p-8">
      <SpecularTier
        legacyCard={{ price: 888 }}
        proCard={{ price: 204 }}
      />
    </div>
  );
}`,
  colorOptions: ['purple', 'black'],
  sizeOptions: ['md'],
  defaultColor: 'purple',
  defaultSize: 'md',
  dependencies: [],
  cliCommand: 'npx atronix add specular-tier',
};

export const templatesRegistry: Record<string, TemplateItem> = {
  'testimonials': testimonialsTemplate,
  'feedback-deck': testimonialsTemplate,
  'specular-tier': specularTierTemplate,
  'flux-scale': specularTierTemplate,
};

export default templatesRegistry;
