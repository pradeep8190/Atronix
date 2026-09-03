import React from 'react';
import type { ComponentItem } from './types';

export const frostVault: ComponentItem = {
  id: 'frost-vault',
  name: 'Frost Vault',
  category: 'Components',
  description: 'An interactive 3D glass folder component featuring animated card reveals, customizable color themes, spring dynamics, and responsive scale options.',
  component: React.lazy(() => import('../../components/ui/frost_vault/Folder')),
  footerComponent: React.lazy(() => import('../../components/ui/frost_vault/FolderFooter')),
  loadCode: () => import('../../components/ui/frost_vault/Folder.tsx?raw').then((m) => m.default),
  loadFiles: async () => {
    const [tsx, css] = await Promise.all([
      import('../../components/ui/frost_vault/Folder.tsx?raw').then((m) => m.default),
      import('../../components/ui/frost_vault/Folder.css?raw').then((m) => m.default),
    ]);
    return { 'Folder.tsx': tsx, 'Folder.css': css };
  },
  getUsageCode: () => `import { Folder } from '@/components/ui/frost_vault/Folder';
import '@/components/ui/frost_vault/Folder.css';

export default function Example() {
  return (
    <div className="flex items-center justify-center min-h-[420px] w-full bg-black p-8">
      <Folder color="black" size="md" />
    </div>
  );
}`,
  colorOptions: ['black', 'white', 'blue'],
  sizeOptions: ['sm', 'md', 'lg'],
  defaultColor: 'black',
  defaultSize: 'md',
  dependencies: ['motion'],
  cliCommand: 'npx atronix add frost-vault',
  hint: 'Hover & click on the folder vault to open/close cards!',
};

export default frostVault;
