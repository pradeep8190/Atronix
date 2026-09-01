import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import './ComponentCode.css';

interface ComponentCodeProps {
  code: string;
  filename?: string;
  copied: boolean;
  onCopyCode: () => void;
  dependencies?: string[];
  cliCommand?: string;
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
  code,
  filename = 'components/ui/frost_vault/Folder.tsx',
  copied,
  onCopyCode,
  dependencies = ['motion'],
  cliCommand = 'npx atronix add frost-vault',
}) => {
  const { notify } = useNotification();
  const lines = code.split('\n');
  const [installMode, setInstallMode] = useState<'cli' | 'manual'>('manual');
  const [installDirection, setInstallDirection] = useState<'right' | 'left'>('left');
  const [packageManager, setPackageManager] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [pmDropdownOpen, setPmDropdownOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

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
              className={`install-mode-btn ${installMode === 'manual' ? 'active' : ''}`}
              onClick={() => handleInstallModeChange('manual')}
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
          <span className="code-filename">{filename}</span>
          <button
            className={`action-icon-btn ${copied ? 'copied-active' : ''}`}
            onClick={onCopyCode}
            title={copied ? 'Code Copied!' : 'Copy Code'}
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

        <div className="code-container">
          {/* Line Numbers Column */}
          <div className="line-numbers">
            {lines.map((_, i) => (
              <div key={i} className="line-number">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Content Area (Two-Color Light Red & White) */}
          <div className="code-content">
            {lines.map((line, i) => (
              <div key={i} className="code-line">
                {parseDualToneLine(line)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCode;
