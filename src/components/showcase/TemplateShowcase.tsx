import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import templatesRegistry from '../../data/templatesRegistry';
import { ComponentCode } from './ComponentCode';
import { useNotification } from '../../context/NotificationContext';
import './TemplateShowcase.css';

interface TemplateShowcaseProps {
  templateId?: string;
}

const viewSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const TemplateShowcase: React.FC<TemplateShowcaseProps> = ({
  templateId = 'testimonials',
}) => {
  const item = templatesRegistry[templateId] || templatesRegistry['testimonials'];
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loadedFiles, setLoadedFiles] = useState<Record<string, string>>({});
  const [codeString, setCodeString] = useState<string>('');

  useEffect(() => {
    setActiveTab('preview');
  }, [item.id]);

  useEffect(() => {
    let isCurrent = true;
    if (item.loadFiles) {
      item.loadFiles().then((files) => {
        if (isCurrent) {
          setLoadedFiles(files);
          const firstKey = Object.keys(files)[0];
          setCodeString(files[firstKey] || '');
        }
      }).catch(() => {
        if (isCurrent) {
          item.loadCode().then((raw) => {
            if (isCurrent) setCodeString(raw);
          });
        }
      });
    } else {
      setLoadedFiles({});
      item.loadCode().then((raw) => {
        if (isCurrent) setCodeString(raw);
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [item.id]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    notify({
      title: isFavorite ? 'Removed from Favorites' : 'Saved to Favorites',
      description: item.name,
      type: 'info',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    notify({
      title: 'Link Copied',
      description: 'Template URL copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setShared(false), 2000);
  };

  const dynamicUsageCode = item.getUsageCode ? item.getUsageCode() : '';
  const multiFiles: Record<string, string> = {
    ...(dynamicUsageCode ? { 'Usage': dynamicUsageCode } : {}),
    ...loadedFiles,
  };

  const handleCopyCode = (customCodeToCopy?: unknown) => {
    const textToCopy = typeof customCodeToCopy === 'string' && customCodeToCopy ? customCodeToCopy : (dynamicUsageCode || codeString);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    notify({
      title: 'Code Copied',
      description: 'Ready to paste into your project.',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const TemplateComponent = item.component;
  const FooterComponent = item.footerComponent;

  return (
    <div className="template-showcase-container">
      {/* 1. Header with Breadcrumb & Title */}
      <div className="template-showcase-header">
        <div className="template-showcase-breadcrumb">
          <span>Templates</span>
          <span className="template-breadcrumb-slash">/</span>
          <span className="template-breadcrumb-current">{item.name}</span>
        </div>
        <h1 className="template-showcase-title">{item.name}</h1>
        <p className="template-showcase-description">{item.description}</p>
      </div>

      {/* 2. Unified Controls Bar (Tabs + Action Icons) */}
      <div className="template-showcase-controls">
        <div className="template-tabs-track">
          <button
            className={`template-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            {activeTab === 'preview' && (
              <motion.div
                layoutId="active-template-glass-pill"
                className="template-active-glass-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
              />
            )}
            <span className="template-tab-btn-content">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Preview
            </span>
          </button>

          <button
            className={`template-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            {activeTab === 'code' && (
              <motion.div
                layoutId="active-template-glass-pill"
                className="template-active-glass-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
              />
            )}
            <span className="template-tab-btn-content">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Code
            </span>
          </button>
        </div>

        <div className="template-controls-right">
          {/* Favorite Button */}
          <button
            className={`template-action-btn ${isFavorite ? 'favorite-active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#ffffff' : 'none'} stroke="#ffffff" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Share Button */}
          <button
            className={`template-action-btn ${shared ? 'shared-active' : ''}`}
            onClick={handleShare}
            title={shared ? 'Link Copied!' : 'Share template'}
          >
            {shared ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </button>

          {/* Copy Code Button */}
          <button
            className={`template-action-btn ${copied ? 'copied-active' : ''}`}
            onClick={() => handleCopyCode()}
            title={copied ? 'Code Copied!' : 'Copy template code'}
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

      {/* 3. Main Stage Preview or Code */}
      <AnimatePresence mode="wait">
        {activeTab === 'preview' ? (
          <motion.div
            key="preview-stage"
            className="template-stage-sandbox"
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={viewSpring}
          >
            <Suspense
              fallback={
                <div className="template-loading-skeleton">
                  <div className="preview-skeleton-spinner" />
                  <span>Loading template stage...</span>
                </div>
              }
            >
              <TemplateComponent />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="code-stage"
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={viewSpring}
          >
            <ComponentCode
              code={codeString}
              files={Object.keys(multiFiles).length > 0 ? multiFiles : undefined}
              copied={copied}
              onCopyCode={handleCopyCode}
              dependencies={item.dependencies}
              cliCommand={item.cliCommand}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Documentation Footer */}
      {FooterComponent && (
        <div className="template-footer-container">
          <Suspense fallback={null}>
            <FooterComponent />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default TemplateShowcase;
