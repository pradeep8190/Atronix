import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HookRail from '../components/HookRail';
import './Sidebar.css';

// Apple-level spring physics configuration
const appleSpring = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 26,
  mass: 0.6,
};

interface SidebarProps {
  onSelectComponent?: (componentId: string) => void;
  selectedComponentId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectComponent,
  selectedComponentId,
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    updates: true,
    installation: true,
    components: true,
  });

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updatesItems = [
    { label: 'Twitter @atronixui', href: 'https://twitter.com/atronixui' },
    { label: 'Learn Tailwind and Motion', href: '#learn' },
  ];

  const installationItems = [
    { label: 'Install Next.js', href: '#install-nextjs' },
    { label: 'Install Tailwind CSS', href: '#install-tailwind' },
    { label: 'Add utilities', href: '#add-utilities' },
  ];

  const componentItems = [
    { label: 'Frost Vault', id: 'frost-vault' },
    { label: 'Aero Core', id: 'aero-core' },
    { label: 'Liquid Mitosis', id: 'liquid-mitosis' },
    { label: 'Cascade Select', id: 'cascade-select' },
    { label: 'Phase Toggle', id: 'phase-toggle' },
    { label: 'Hydro Button', id: 'hydro-button' },
    { label: 'Mercury Slider', id: 'mercury-slider' },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-content">
        {/* Section 1: Follow for updates */}
        <div className="sidebar-group">
          <button
            className="sidebar-group-header"
            onClick={() => toggleCategory('updates')}
          >
            <div className="group-header-left">
              <span className="group-header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="group-header-title">Follow for updates</span>
            </div>
            <motion.svg
              animate={{ rotate: openCategories.updates ? 0 : 180 }}
              transition={appleSpring}
              className="chevron-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
          </button>

          <AnimatePresence initial={false}>
            {openCategories.updates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={appleSpring}
                style={{ overflow: 'hidden' }}
                className="sidebar-rail-wrapper"
              >
                <HookRail items={updatesItems} color="#ffffff" dashed={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 2: Installation */}
        <div className="sidebar-group">
          <button
            className="sidebar-group-header"
            onClick={() => toggleCategory('installation')}
          >
            <div className="group-header-left">
              <span className="group-header-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              <span className="group-header-title">Installation</span>
            </div>
            <motion.svg
              animate={{ rotate: openCategories.installation ? 0 : 180 }}
              transition={appleSpring}
              className="chevron-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
          </button>

          <AnimatePresence initial={false}>
            {openCategories.installation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={appleSpring}
                style={{ overflow: 'hidden' }}
                className="sidebar-rail-wrapper"
              >
                <HookRail items={installationItems} color="#ffffff" dashed={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 3: Components */}
        <div className="sidebar-group">
          <button
            className="sidebar-group-header"
            onClick={() => toggleCategory('components')}
          >
            <div className="group-header-left">
              <span className="group-header-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <span className="group-header-title">Components</span>
            </div>
            <motion.svg
              animate={{ rotate: openCategories.components ? 0 : 180 }}
              transition={appleSpring}
              className="chevron-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
          </button>

          <AnimatePresence initial={false}>
            {openCategories.components && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={appleSpring}
                style={{ overflow: 'hidden' }}
                className="sidebar-rail-wrapper"
              >
                {(() => {
                  const activeIndex = componentItems.findIndex(
                    (item) => item.id === selectedComponentId
                  );
                  return (
                    <HookRail
                      items={componentItems}
                      color="#ffffff"
                      dashed={false}
                      value={activeIndex >= 0 ? activeIndex : undefined}
                      onChange={(index) => {
                        const selected = componentItems[index];
                        if (selected) {
                          onSelectComponent?.(selected.id);
                        }
                      }}
                    />
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
