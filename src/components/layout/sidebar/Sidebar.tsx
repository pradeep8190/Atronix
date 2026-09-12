import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HookRail from './HookRail';
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
  onNavigate?: (page: 'home' | 'components' | 'templates' | 'about') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectComponent,
  selectedComponentId,
  onSelectTemplate,
  selectedTemplateId,
  activeSection = 'components',
  className,
  onItemClick,
  onNavigate,
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
    {
      label: 'About Developer',
      href: '/about',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (onNavigate) {
          onNavigate('about');
        } else {
          window.history.pushState({ page: 'about' }, '', '/about');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        onItemClick?.();
      },
    },
    { label: 'Twitter @atronixui', href: 'https://twitter.com/atronixui' },
  ];

  const installationItems = [
    { label: 'CLI Setup', href: '#cli' },
    { label: 'Manual Setup', href: '#manual' },
    { label: 'Dependencies', href: '#dependencies' },
  ];

  interface SubSection {
    id: string;
    title: string;
    items: { label: string; id: string }[];
  }

  const componentSubSections: SubSection[] = [
    {
      id: 'hero',
      title: 'Hero & 3D Centerpieces',
      items: [
        { label: 'Frost Vault', id: 'frost-vault' },
        { label: 'Graviton Field', id: 'graviton-field' },
        { label: 'Quantum Morph', id: 'quantum-morph' },
        { label: 'Pendant Lamp', id: 'pendant-lamp' },
        { label: 'Aero Core', id: 'aero-core' },
        { label: 'Tyndall Beam', id: 'tyndall-beam' },
        { label: 'Orbit Globe', id: 'orbit-globe' },
        { label: 'Speed Rays', id: 'speed-rays' },
      ],
    },
    {
      id: 'actions',
      title: 'Navigation & Actions',
      items: [
        { label: 'Kinetic Tabs', id: 'kinetic-tabs' },
        { label: 'Liquid Mitosis', id: 'liquid-mitosis' },
        { label: 'Hydro Button', id: 'hydro-button' },
        { label: 'Optic Deck', id: 'optic-deck' },
        { label: 'Plasma Button', id: 'plasma-button' },
      ],
    },
    {
      id: 'inputs',
      title: 'Inputs & Controls',
      items: [
        { label: 'Eclipse Switch', id: 'eclipse-switch' },
        { label: 'Cascade Select', id: 'cascade-select' },
        { label: 'Mercury Slider', id: 'mercury-slider' },
        { label: 'Silica Slider', id: 'silica-slider' },
      ],
    },
  ];

  const [openSubCategories, setOpenSubCategories] = useState<Record<string, boolean>>({
    hero: true,
    actions: true,
    inputs: true,
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="group-header-title">Developer & Community</span>
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
