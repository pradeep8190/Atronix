import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DeviceViewport } from './DeviceViewport';
import { GitHubCodeExplorer } from './GitHubCodeExplorer';
import { useGitHubRepo } from './hooks/useGitHubRepo';
import type { AppShowcaseMeta } from './types';
import './AppShowcase.css';

interface AppShowcaseProps {
  appMeta?: AppShowcaseMeta;
  onBackToComponents?: () => void;
}

const defaultJarvisMeta: AppShowcaseMeta = {
  id: 'jarvis-website',
  name: 'Horizon — Jarvis AI',
  tagline:
    'A true autonomous intelligence agent engineered to orchestrate all machine infrastructure and home automation workflows in real time, executing any automation imaginable at the lowest possible operating cost.',
  description:
    'A true autonomous intelligence agent engineered to orchestrate all machine infrastructure and home automation workflows in real time, executing any automation imaginable at the lowest possible operating cost.',
  owner: 'radhasaini4604-cloud',
  repo: 'jarvis_website',
  branch: 'main',
  liveUrl: 'https://jarvis282.netlify.app/',
  tags: ['Production Ready', 'Open Source', 'Vite + React'],
  techStack: ['React 19', 'TypeScript', 'Vite', 'Tailwind', 'Netlify'],
};

export const AppShowcase: React.FC<AppShowcaseProps> = ({
  appMeta = defaultJarvisMeta,
  onBackToComponents,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'setup'>('preview');
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [copiedClone, setCopiedClone] = useState(false);

  const handleTabChange = (newTab: 'preview' | 'code' | 'setup') => {
    if (newTab === activeTab) return;
    const tabOrder: ('preview' | 'code' | 'setup')[] = ['preview', 'code', 'setup'];
    const prevIdx = tabOrder.indexOf(activeTab);
    const nextIdx = tabOrder.indexOf(newTab);
    setDirection(nextIdx > prevIdx ? 'right' : 'left');
    setActiveTab(newTab);
  };

  const {
    tree,
    selectedPath,
    selectedCode,
    isLoadingTree,
    isLoadingFile,
    error,
    selectFile,
    refetch,
  } = useGitHubRepo(appMeta.owner, appMeta.repo, appMeta.branch);

  const cloneCommand = `git clone https://github.com/${appMeta.owner}/${appMeta.repo}.git\ncd ${appMeta.repo}\nnpm install\nnpm run dev`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="app-showcase-page">
      {/* Top Header Section */}
      <div className="showcase-header">
        <div className="showcase-breadcrumb">
          <span className="breadcrumb-category">Templates & Apps</span>
          <span className="breadcrumb-slash">/</span>
          <span className="breadcrumb-current">{appMeta.name}</span>
        </div>

        <div className="showcase-title-row">
          <h1 className="showcase-title">{appMeta.name}</h1>
          <span className="showcase-live-badge">Live System</span>
        </div>

        <p className="showcase-desc">{appMeta.tagline}</p>

        <div className="showcase-meta-row">
          <div className="showcase-tech-pills">
            {appMeta.techStack.map((tech, idx) => (
              <React.Fragment key={tech}>
                {idx > 0 && <span className="tech-dot">/</span>}
                <span className="tech-pill">{tech}</span>
              </React.Fragment>
            ))}
          </div>

          <a
            href={`https://github.com/${appMeta.owner}/${appMeta.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="github-link-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>github.com/{appMeta.owner}/{appMeta.repo}</span>
          </a>
        </div>
      </div>

      {/* Segmented Control Pill Bar matching ComponentShowcase */}
      <div className="showcase-tabs-bar">
        <div className="tabs-left">
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => handleTabChange('preview')}
          >
            {activeTab === 'preview' && (
              <motion.div
                layoutId="template-active-glass-pill"
                className="active-glass-pill"
                initial={false}
                animate={{
                  scaleX: [1, 1.15, 0.96, 1],
                  scaleY: [1, 0.92, 1.03, 1],
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
              Live Viewport
            </span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => handleTabChange('code')}
          >
            {activeTab === 'code' && (
              <motion.div
                layoutId="template-active-glass-pill"
                className="active-glass-pill"
                initial={false}
                animate={{
                  scaleX: [1, 1.15, 0.96, 1],
                  scaleY: [1, 0.92, 1.03, 1],
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
              GitHub Code Explorer
            </span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => handleTabChange('setup')}
          >
            {activeTab === 'setup' && (
              <motion.div
                layoutId="template-active-glass-pill"
                className="active-glass-pill"
                initial={false}
                animate={{
                  scaleX: [1, 1.15, 0.96, 1],
                  scaleY: [1, 0.92, 1.03, 1],
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
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              Setup & Clone
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="showcase-panel">
        {activeTab === 'preview' && (
          <DeviceViewport initialUrl={appMeta.liveUrl} projectName={appMeta.name} />
        )}

        {activeTab === 'code' && (
          <GitHubCodeExplorer
            tree={tree}
            selectedPath={selectedPath}
            selectedCode={selectedCode}
            isLoadingTree={isLoadingTree}
            isLoadingFile={isLoadingFile}
            error={error}
            onSelectFile={selectFile}
            onRetry={refetch}
          />
        )}

        {activeTab === 'setup' && (
          <div className="setup-panel-container">
            <div className="setup-card">
              <div className="setup-card-header">
                <span className="setup-card-title">Quick Clone & Run</span>
                <button className="setup-copy-btn" onClick={handleCopyClone}>
                  {copiedClone ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#34d399' }}>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="setup-terminal">
                <code>{cloneCommand}</code>
              </pre>
            </div>

            <div className="setup-features-grid">
              <div className="feature-item">
                <h3 className="feature-title">Real-Time Component Sync</h3>
                <p className="feature-desc">
                  This showcase is connected live to GitHub. Any pushes or pull requests merged to the repository reflect instantly inside Atronix.
                </p>
              </div>

              <div className="feature-item">
                <h3 className="feature-title">Zero Local Dependencies</h3>
                <p className="feature-desc">
                  Runs entirely sandboxed through secure GitHub raw CDN streamers and responsive container frames, maintaining 120 FPS performance in the core design system.
                </p>
              </div>

              <div className="feature-item">
                <h3 className="feature-title">Modular Architecture</h3>
                <p className="feature-desc">
                  Built with modern TypeScript and Vite bundle configurations, ready to deploy to Netlify, Vercel, or AWS Amplify.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppShowcase;
