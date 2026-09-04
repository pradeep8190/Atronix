import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import './ComponentCode.css';

interface ComponentCodeProps {
  code?: string;
  files?: Record<string, string>;
  filename?: string;
  copied: boolean;
  onCopyCode: (codeToCopy?: string) => void;
  dependencies?: string[];
  cliCommand?: string;
  cliOnly?: boolean;
  cliOnlyReason?: string;
}

// Two-color Syntax Highlighter (Light Red & White Only)
const parseDualToneLine = (line: string): React.ReactNode => {
  if (!line) return ' ';

  const trimmed = line.trim();

  // Full Line "use client" directive
  if (trimmed === '"use client";' || trimmed === "'use client';") {
    const indentMatch = line.match(/^\s*/);
    const indent = indentMatch ? indentMatch[0] : '';
    return (
      <>
        {indent}
        <span className="code-highlight-red">{trimmed}</span>
      </>
    );
  }

  // Tokenizer matching Keywords, JSX Tags, and Numbers for Light Red
  const tokenRegex =
    /("use client"|'use client'|\b(import|export|from|const|let|var|function|return|type|interface|default|as|new|await|if|else|switch|case|break|typeof|instanceof|void|undefined|null|true|false)\b|\b\d+(\.\d+)?\b|<\/?[a-zA-Z0-9_\.]+|(?<=\s)className(?==))/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    const index = match.index;

    // White text before token
    if (index > lastIndex) {
      elements.push(
        <span key={`w-${lastIndex}`} className="code-white">
          {line.slice(lastIndex, index)}
        </span>
      );
    }

    // Light Red Token
    elements.push(
      <span key={`r-${index}`} className="code-highlight-red">
        {token}
      </span>
    );

    lastIndex = index + token.length;
  }

  // Remaining white text
  if (lastIndex < line.length) {
    elements.push(
      <span key={`w-${lastIndex}`} className="code-white">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return elements;
};

export const ComponentCode: React.FC<ComponentCodeProps> = ({
  code = '',
  files,
  filename = 'components/ui/aero_core/AeroCore.tsx',
  copied,
  onCopyCode,
  dependencies = ['motion'],
  cliCommand = 'npx atronix add aero-core',
  cliOnly = false,
  cliOnlyReason,
}) => {
  const { notify } = useNotification();
  const fileKeys = files ? Object.keys(files) : [];
  const [activeFileName, setActiveFileName] = useState<string>(fileKeys[0] || filename);

  useEffect(() => {
    if (fileKeys.length > 0 && (!activeFileName || !files?.[activeFileName])) {
      setActiveFileName(fileKeys[0]);
    }
  }, [files]);

  const activeCode = files && files[activeFileName] !== undefined ? files[activeFileName] : code;
  const lines = (activeCode || '').split('\n');

  const [isExpanded, setIsExpanded] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsExpanded(false);
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = 0;
    }
  }, [activeFileName]);

  const PREVIEW_VISIBLE_LINES = 15;
  const linesLeft = Math.max(0, lines.length - PREVIEW_VISIBLE_LINES);
  const hasOverflow = lines.length > 20;

  const [installMode, setInstallMode] = useState<'cli' | 'manual'>(cliOnly ? 'cli' : 'manual');
  const [installDirection, setInstallDirection] = useState<'right' | 'left'>('left');
  const [packageManager, setPackageManager] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [pmDropdownOpen, setPmDropdownOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  useEffect(() => {
    if (cliOnly) {
      setInstallMode('cli');
    }
  }, [cliOnly]);

  const pmDropdownRef = useRef<HTMLDivElement>(null);
  const pmOptions: ('npm' | 'pnpm' | 'yarn' | 'bun')[] = ['npm', 'pnpm', 'yarn', 'bun'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pmDropdownRef.current && !pmDropdownRef.current.contains(event.target as Node)) {
        setPmDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallModeChange = (newMode: 'cli' | 'manual') => {
    if (cliOnly && newMode === 'manual') {
      notify({
        title: 'CLI-Only Component',
        description: cliOnlyReason || 'Manual copy is disabled because this component requires dedicated WebGL physics engine files.',
        type: 'info',
      });
      return;
    }
    if (newMode === installMode) return;
    setInstallDirection(newMode === 'manual' ? 'right' : 'left');
    setInstallMode(newMode);
  };

  const getInstallCommand = () => {
    if (installMode === 'cli') {
      return cliCommand;
    }
    const deps = dependencies.join(' ');
    switch (packageManager) {
      case 'pnpm':
        return `pnpm add ${deps}`;
      case 'yarn':
        return `yarn add ${deps}`;
      case 'bun':
        return `bun add ${deps}`;
      case 'npm':
      default:
        return `npm i ${deps}`;
    }
  };

  const currentInstallCommand = getInstallCommand();

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(currentInstallCommand);
    setCopiedInstall(true);
    notify({
      title: 'Command Copied',
      description: `${currentInstallCommand} ready to paste`,
      type: 'copy',
    });
    setTimeout(() => setCopiedInstall(false), 1000);
  };

  return (
    <div className="code-tab-wrapper">
      {/* Minimalist Pill: CLI Installation Required (No Border Line) */}
      {cliOnly && (
        <div
          className="cli-required-pill"
          title={cliOnlyReason || 'CLI installation required for WebGL engine files'}
        >
          CLI Installation Required
        </div>
      )}

      {/* Refined Unified Single Install Card */}
      <div className="install-card-unified">
        {/* Left Side: Code Command with AnimatePresence Morph */}
        <div className="install-command-left">
          <AnimatePresence mode="wait">
            <motion.code
              key={currentInstallCommand}
              initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="command-text"
            >
              {parseDualToneLine(currentInstallCommand)}
            </motion.code>
          </AnimatePresence>
        </div>

        {/* Right Side: Glass Controls with Framer Motion Layout Motion */}
        <motion.div layout className="install-controls-right">
          {/* Glass Mode Switcher: CLI | Manual */}
          <motion.div layout className="install-mode-toggle">
            <button
              className={`install-mode-btn ${installMode === 'cli' ? 'active' : ''}`}
              onClick={() => handleInstallModeChange('cli')}
            >
              {installMode === 'cli' && (
                <motion.div
                  layoutId="active-install-mode-pill"
                  className="active-glass-pill"
                  initial={false}
                  animate={{
                    scaleX: [1, 1.18, 0.96, 1],
                    scaleY: [1, 0.92, 1.02, 1],
                  }}
                  style={{
                    transformOrigin: installDirection === 'right' ? 'left center' : 'right center',
                  }}
                  transition={{
                    layout: { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 },
                    scaleX: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                    scaleY: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                  }}
                />
              )}
              <span className="install-btn-text">CLI</span>
            </button>

            <button
              className={`install-mode-btn ${installMode === 'manual' ? 'active' : ''} ${cliOnly ? 'disabled-cli-only' : ''}`}
              onClick={() => handleInstallModeChange('manual')}
              title={cliOnly ? (cliOnlyReason || 'Manual installation disabled: requires WebGL engine files') : 'Manual installation'}
              aria-disabled={cliOnly}
            >
              {installMode === 'manual' && (
                <motion.div
                  layoutId="active-install-mode-pill"
                  className="active-glass-pill"
                  initial={false}
                  animate={{
                    scaleX: [1, 1.18, 0.96, 1],
                    scaleY: [1, 0.92, 1.02, 1],
                  }}
                  style={{
                    transformOrigin: installDirection === 'right' ? 'left center' : 'right center',
                  }}
                  transition={{
                    layout: { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 },
                    scaleX: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                    scaleY: { duration: 0.35, times: [0, 0.4, 0.75, 1], ease: 'easeInOut' },
                  }}
                />
              )}
              <span className="install-btn-text">Manual</span>
            </button>
          </motion.div>

          {/* Liquid Glass Package Manager Dropdown with Active Glass Lens */}
          <AnimatePresence mode="popLayout">
            {installMode === 'manual' && (
              <motion.div
                key="pm-dropdown-motion"
                layout
                initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)', width: 0 }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', width: 'auto' }}
                exit={{ opacity: 0, scale: 0.85, filter: 'blur(6px)', width: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 26,
                  mass: 0.7,
                }}
                className="custom-pm-dropdown-container"
                ref={pmDropdownRef}
              >
                <button
                  className={`custom-pm-trigger ${pmDropdownOpen ? 'open' : ''}`}
                  onClick={() => setPmDropdownOpen(!pmDropdownOpen)}
                >
                  <motion.div
                    className="active-glass-pill"
                    style={{ position: 'absolute', inset: 0, borderRadius: 8 }}
                  />
                  <span>{packageManager}</span>
                  <motion.svg
                    animate={{ rotate: pmDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </motion.svg>
                </button>

                {/* Floating Animated Glass Menu Popup with Liquid Glass Selected Item */}
                <AnimatePresence>
                  {pmDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="custom-pm-menu"
                    >
                      {pmOptions.map((option) => (
                        <button
                          key={option}
                          className={`custom-pm-item ${packageManager === option ? 'selected' : ''}`}
                          onClick={() => {
                            setPackageManager(option);
                            setPmDropdownOpen(false);
                          }}
                        >
                          {packageManager === option && (
                            <motion.div
                              layoutId="active-pm-item-pill"
                              className="active-glass-pill"
                              style={{ position: 'absolute', inset: 0, borderRadius: 7 }}
                              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                            />
                          )}
                          <span className="pm-item-text">{option}</span>
                          {packageManager === option && (
                            <svg className="pm-item-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copy Command Icon Button */}
          <motion.button
            layout
            className={`action-icon-btn ${copiedInstall ? 'copied-active' : ''}`}
            onClick={handleCopyInstall}
            title={copiedInstall ? 'Command Copied!' : 'Copy Command'}
          >
            {copiedInstall ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Main Code Sandbox */}
      <div className="code-sandbox">
        <div className="code-header">
          {fileKeys.length > 1 ? (
            <div className="code-file-tabs">
              {fileKeys.map((name) => {
                const isActive = activeFileName === name;
                return (
                  <button
                    key={name}
                    className={`code-file-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveFileName(name)}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-code-file-pill"
                        className="active-glass-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      />
                    )}
                    <span className="file-tab-icon">
                      {name === 'Usage' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      ) : name.endsWith('.css') ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.938 6.5 17.5 2 12 2z" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      )}
                    </span>
                    <span className="file-tab-label">{name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="code-filename">{activeFileName || filename}</span>
          )}

          <button
            className={`action-icon-btn ${copied ? 'copied-active' : ''}`}
            onClick={() => onCopyCode(activeCode)}
            title={`Copy ${activeFileName}`}
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

        <div
          ref={codeContainerRef}
          className={`code-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
          {...(isExpanded ? { 'data-lenis-prevent': 'true' } : {})}
        >
          {!activeCode ? (
            <div style={{ padding: '36px 28px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', fontFamily: 'monospace' }}>
              Loading source code chunk...
            </div>
          ) : (
            <>
              {/* Line Numbers Column */}
              <div className="line-numbers">
                {lines.map((_: string, i: number) => (
                  <div key={i} className="line-number">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code Content Area (Two-Color Light Red & White) */}
              <div className="code-content">
                {lines.map((line: string, i: number) => (
                  <div key={i} className="code-line">
                    {parseDualToneLine(line)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Show All Overlay when collapsed */}
        {!isExpanded && hasOverflow && (
          <div className="code-expand-overlay">
            <button
              type="button"
              className="code-expand-btn"
              onClick={() => setIsExpanded(true)}
            >
              <span>Show all</span>
              <span className="code-expand-badge">({linesLeft} lines left)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Collapse Button bar when expanded */}
        {isExpanded && hasOverflow && (
          <div className="code-collapse-bar">
            <button
              type="button"
              className="code-collapse-btn"
              onClick={() => {
                setIsExpanded(false);
                codeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span>Collapse ({lines.length} lines)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentCode;
