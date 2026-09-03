import React from 'react';

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  footerComponent?: React.LazyExoticComponent<React.ComponentType<any>>;
  loadCode: () => Promise<string>;
  loadFiles?: () => Promise<Record<string, string>>;
  getUsageCode?: (props?: Record<string, any>) => string;
  defaultProps?: Record<string, any>;
  colorOptions?: string[];
  sizeOptions?: string[];
  defaultColor?: string;
  defaultSize?: string;
  dependencies?: string[];
  cliCommand?: string;
  hint?: string;
}
