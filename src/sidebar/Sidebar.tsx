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
  onSelectTemplate?: (templateId: string) => void;
  selectedTemplateId?: string;
  activeSection?: 'components' | 'templates';
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectComponent,
  selectedComponentId,
  onSelectTemplate,
  selectedTemplateId,
  activeSection = 'components',
  className,
  onItemClick,
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    updates: true,
    installation: true,
    components: true,
    templates: true,
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

  interface SubSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    items: { label: string; id: string }[];
  }

  const componentSubSections: SubSection[] = [
    {
      id: 'inputs',
      title: 'Inputs & Controls',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      ),
      items: [
        { label: 'Hydro Button', id: 'hydro-button' },
        { label: 'Optic Deck', id: 'optic-deck' },
        { label: 'Plasma Button', id: 'plasma-button' },
        { label: 'Mercury Slider', id: 'mercury-slider' },
        { label: 'Silica Slider', id: 'silica-slider' },
        { label: 'Eclipse Switch', id: 'eclipse-switch' },
      ],
    },
    {
      id: 'navigation',
      title: 'Navigation & Select',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      ),
      items: [
        { label: 'Kinetic Tabs', id: 'kinetic-tabs' },
        { label: 'Cascade Select', id: 'cascade-select' },
        { label: 'Lens Strip', id: 'lens-strip' },
      ],
    },
    {
      id: 'surfaces',
      title: 'Surfaces & Cards',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      items: [
        { label: 'Frost Vault', id: 'frost-vault' },
        { label: 'Atmosphere Card', id: 'atmosphere-card' },
      ],
    },
    {
      id: 'physics',
      title: 'WebGL & Physics',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z" />
        </svg>
      ),
      items: [
        { label: 'Aero Core', id: 'aero-core' },
        { label: 'Liquid Mitosis', id: 'liquid-mitosis' },
        { label: 'Graviton Field', id: 'graviton-field' },
        { label: 'Quantum Morph', id: 'quantum-morph' },
        { label: 'Tyndall Beam', id: 'tyndall-beam' },
        { label: 'Orbit Globe', id: 'orbit-globe' },
        { label: 'Speed Rays', id: 'speed-rays' },
        { label: 'Pendant Lamp', id: 'pendant-lamp' },
      ],
    },
  ];

  const [openSubCategories, setOpenSubCategories] = useState<Record<string, boolean>>({
    inputs: true,
    navigation: true,
    surfaces: true,
    physics: true,
  });

  const toggleSubCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSubCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Auto-expand subcategory when selected component changes
  React.useEffect(() => {
    if (!selectedComponentId) return;
    const sub = componentSubSections.find((s) =>
      s.items.some((item) => item.id === selectedComponentId)
    );
    if (sub) {
      setOpenSubCategories((prev) => ({ ...prev, [sub.id]: true }));
      setOpenCategories((prev) => ({ ...prev, components: true }));
    }
  }, [selectedComponentId]);

  const templateItems = [
    { label: 'Decentralized Testimonials', id: 'testimonials' },
    { label: 'Specular Tier', id: 'specular-tier' },
  ];

  return (
    <aside className={`sidebar-container ${className || ''}`} data-lenis-prevent>
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
                <div className="sidebar-subgroups-container">
                  {componentSubSections.map((sub) => {
                    const isSubOpen = openSubCategories[sub.id] ?? true;
                    const activeIndex =
                      activeSection === 'components'
                        ? sub.items.findIndex((item) => item.id === selectedComponentId)
                        : -1;
                    const hasActiveChild = activeIndex >= 0;

                    return (
                      <div key={sub.id} className="sidebar-subgroup">
                        <button
                          type="button"
                          className={`sidebar-subgroup-header ${hasActiveChild ? 'has-active' : ''}`}
                          onClick={(e) => toggleSubCategory(sub.id, e)}
                        >
                          <div className="subgroup-header-left">
                            <span className="subgroup-header-icon">{sub.icon}</span>
                            <span className="subgroup-header-title">{sub.title}</span>
                            <span className="sidebar-sub-count">{sub.items.length}</span>
                          </div>
                          <motion.svg
                            animate={{ rotate: isSubOpen ? 0 : -90 }}
                            transition={appleSpring}
                            className="sub-chevron-icon"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </motion.svg>
                        </button>

                        <AnimatePresence initial={false}>
                          {isSubOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={appleSpring}
                              style={{ overflow: 'hidden' }}
                              className="sidebar-subrail-wrapper"
                            >
                              <HookRail
                                items={sub.items}
                                color="#ffffff"
                                dashed={false}
                                value={activeIndex >= 0 ? activeIndex : -1}
                                onChange={(index) => {
                                  const selected = sub.items[index];
                                  if (selected) {
                                    onSelectComponent?.(selected.id);
                                    onItemClick?.();
                                  }
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 4: Templates (Full-Width Cinematic Sections) */}
        <div className="sidebar-group">
          <button
            className="sidebar-group-header"
            onClick={() => toggleCategory('templates')}
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
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </span>
              <span className="group-header-title">Templates</span>
              <span className="sidebar-new-badge">NEW</span>
            </div>
            <motion.svg
              animate={{ rotate: openCategories.templates ? 0 : 180 }}
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
            {openCategories.templates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={appleSpring}
                style={{ overflow: 'hidden' }}
                className="sidebar-rail-wrapper"
              >
                {(() => {
                  const activeIndex =
                    activeSection === 'templates'
                      ? templateItems.findIndex((item) => item.id === selectedTemplateId)
                      : -1;
                  return (
                    <HookRail
                      items={templateItems}
                      color="#ff5263"
                      dashed={false}
                      value={activeIndex >= 0 ? activeIndex : undefined}
                      onChange={(index) => {
                        const selected = templateItems[index];
                        if (selected) {
                          onSelectTemplate?.(selected.id);
                          onItemClick?.();
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
