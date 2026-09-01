import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import componentsRegistry from '../../data/componentsRegistry';
import { ComponentPreview } from './ComponentPreview';
import { ComponentCode } from './ComponentCode';
import { ShowcaseFooter } from './ShowcaseFooter';
import { useNotification } from '../../context/NotificationContext';
import './ComponentShowcase.css';

interface ComponentShowcaseProps {
  componentId?: string;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  componentId = 'frost-vault',
}) => {
  const item = componentsRegistry[componentId] || componentsRegistry['frost-vault'];
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [selectedColor] = useState<string>(item.defaultColor || 'black');
  const [selectedSize] = useState<string>(item.defaultSize || 'md');
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (newTab: 'preview' | 'code') => {
    if (newTab === activeTab) return;
    setDirection(newTab === 'code' ? 'right' : 'left');
    setActiveTab(newTab);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    notify({
      title: 'Code Copied',
      description: `${item.name} component code copied to clipboard`,
      type: 'copy',
    });
    setTimeout(() => setCopied(false), 1000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    notify({
      title: 'Link Copied',
      description: 'Component showcase link copied to clipboard',
      type: 'share',
    });
    setTimeout(() => setShared(false), 1000);
  };

  const handleToggleFavorite = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (nextState) {
      notify({
        title: 'Saved to Favorites',
        description: `${item.name} added to your collection`,
        type: 'favorite',
      });
    }
  };

  // View Dissolve/Scale Spring Config
  const viewSpring = {
    type: 'spring' as const,
    stiffness: 350,
    damping: 28,
  };

  return (
    <main className="showcase-container">
      {/* Header Section */}
      <div className="showcase-header">
        <div className="showcase-breadcrumb">
          <span>{item.category}</span>
          <span className="breadcrumb-slash">/</span>
          <span className="breadcrumb-current">{item.name}</span>
        </div>
        <h1 className="showcase-title">{item.name}</h1>
        <p className="showcase-desc">{item.description}</p>
      </div>

      {/* Control & Tab Switcher Bar */}
      <div className="showcase-tabs-bar">
        {/* Apple Segmented Control with Controlled Liquid Rubber Stretch Lens */}
        <div className="tabs-left">
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => handleTabChange('preview')}
          >
            {activeTab === 'preview' && (
              <motion.div
                layoutId="active-tab-glass-pill"
                className="active-glass-pill"
                initial={false}
                animate={{
                  scaleX: [1, 1.2, 0.96, 1],
                  scaleY: [1, 0.9, 1.03, 1],
                }}
                style={{
                  transformOrigin: direction === 'right' ? 'left center' : 'right center',
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 },
                  scaleX: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                  scaleY: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                }}
              />
            )}
            <span className="tab-btn-content">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Preview
            </span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => handleTabChange('code')}
          >
            {activeTab === 'code' && (
              <motion.div
                layoutId="active-tab-glass-pill"
                className="active-glass-pill"
                initial={false}
                animate={{
                  scaleX: [1, 1.2, 0.96, 1],
                  scaleY: [1, 0.9, 1.03, 1],
                }}
                style={{
                  transformOrigin: direction === 'right' ? 'left center' : 'right center',
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 420, damping: 28, mass: 0.7 },
                  scaleX: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                  scaleY: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                }}
              />
            )}
            <span className="tab-btn-content">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Code
            </span>
          </button>
        </div>

        {/* Right Side Pure Monochrome Action Icons: Favorite, Share, Copy */}
        <div className="controls-right">
          {/* Favorite Icon Button */}
          <button
            className={`action-icon-btn ${isFavorite ? 'favorite-active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#ffffff' : 'none'} stroke="#ffffff" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Share Icon Button */}
          <button
            className={`action-icon-btn ${shared ? 'shared-active' : ''}`}
            onClick={handleShare}
            title={shared ? 'Link Copied!' : 'Share component'}
          >
            {shared ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 1 2 2h12a2 2 0 0 1 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            )}
          </button>

          {/* Copy Icon Button */}
          <button
            className={`action-icon-btn ${copied ? 'copied-active' : ''}`}
            onClick={handleCopyCode}
            title={copied ? 'Copy component code' : 'Copy component code'}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main View Sandbox with Liquid Morph Transition */}
      <AnimatePresence mode="wait">
        {activeTab === 'preview' ? (
          <motion.div
            key="preview-view"
            initial={{ opacity: 0, y: 10, scale: 0.985, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.985, filter: 'blur(6px)' }}
            transition={viewSpring}
          >
            <ComponentPreview
              component={item.component}
              color={selectedColor}
              size={selectedSize}
            />
          </motion.div>
        ) : (
          <motion.div
            key="code-view"
            initial={{ opacity: 0, y: 10, scale: 0.985, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.985, filter: 'blur(6px)' }}
            transition={viewSpring}
          >
            <ComponentCode
              code={item.code}
              copied={copied}
              onCopyCode={handleCopyCode}
              dependencies={item.dependencies}
              cliCommand={item.cliCommand}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Component Showcase Footer & Component-Specific Props Guide */}
      <ShowcaseFooter CustomFooter={item.footerComponent} />
    </main>
  );
};

export default ComponentShowcase;
