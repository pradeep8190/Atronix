import React, { useState } from 'react';
import type { FileTreeNode } from './types';
import './GitHubCodeExplorer.css';

interface GitHubCodeExplorerProps {
  tree: FileTreeNode[];
  selectedPath: string;
  selectedCode: string;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  error: string | null;
  onSelectFile: (path: string) => void;
  onRetry: () => void;
}

// Crisp SVG Icons (Strictly No Emojis)
const FolderIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={isOpen ? '#94a3b8' : '#64748b'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="tree-icon"
  >
    {isOpen ? (
      <>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        <path d="M2 10h20" />
      </>
    ) : (
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    )}
  </svg>
);

const FileIcon: React.FC<{ name: string }> = ({ name }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  let stroke = '#94a3b8';

  if (ext === 'tsx' || ext === 'ts') stroke = '#38bdf8';
  else if (ext === 'jsx' || ext === 'js') stroke = '#facc15';
  else if (ext === 'css') stroke = '#818cf8';
  else if (ext === 'json') stroke = '#fbbf24';
  else if (ext === 'html') stroke = '#fb923c';
  else if (ext === 'md') stroke = '#a3e635';

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="tree-icon"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
};

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
      transition: 'transform 0.18s ease',
    }}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Recursive File Tree Item
const TreeNode: React.FC<{
  node: FileTreeNode;
  depth: number;
  selectedPath: string;
  onSelectFile: (path: string) => void;
}> = ({ node, depth, selectedPath, onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(depth === 0 || node.name === 'src');
  const isSelected = node.path === selectedPath;

  if (node.type === 'folder') {
    return (
      <div className="tree-group">
        <button
          className="tree-row folder-row"
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="tree-chevron">
            <ChevronIcon isOpen={isOpen} />
          </span>
          <FolderIcon isOpen={isOpen} />
          <span className="tree-label">{node.name}</span>
        </button>

        {isOpen && node.children && (
          <div className="tree-children">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={`tree-row file-row ${isSelected ? 'is-selected' : ''}`}
      style={{ paddingLeft: `${depth * 14 + 24}px` }}
      onClick={() => onSelectFile(node.path)}
    >
      <FileIcon name={node.name} />
      <span className="tree-label">{node.name}</span>
    </button>
  );
};

export const GitHubCodeExplorer: React.FC<GitHubCodeExplorerProps> = ({
  tree,
  selectedPath,
  selectedCode,
  isLoadingTree,
  isLoadingFile,
  error,
  onSelectFile,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!selectedCode) return;
    navigator.clipboard.writeText(selectedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = selectedCode.split('\n');

  return (
    <div className="code-explorer-container">
      {/* Left Sidebar: File Tree */}
      <aside className="code-explorer-sidebar">
        <div className="explorer-header">
          <span className="explorer-title">Repository Tree</span>
          {isLoadingTree && <span className="explorer-status">Syncing...</span>}
        </div>

        {error ? (
          <div className="explorer-error">
            <p className="error-text">{error}</p>
            <button className="error-retry-btn" onClick={onRetry}>
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="explorer-tree-scroll">
            {tree.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Right Pane: Code Viewer */}
      <main className="code-explorer-main">
        <div className="code-viewer-header">
          <div className="code-breadcrumbs">
            <span className="crumb-repo">jarvis_website</span>
            {selectedPath.split('/').map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="crumb-sep">/</span>
                <span className={`crumb-part ${idx === selectedPath.split('/').length - 1 ? 'is-active' : ''}`}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="code-actions">
            <span className="code-line-count">{lines.length} lines</span>
            <button className="code-copy-btn" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ color: '#34d399' }}>Copied</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="code-editor-viewport">
          {isLoadingFile ? (
            <div className="code-loading-state">
              <div className="code-pulse-bar" />
              <span>Streaming source from GitHub...</span>
            </div>
          ) : (
            <div className="code-table">
              <div className="code-gutter">
                {lines.map((_, i) => (
                  <span key={i} className="gutter-num">
                    {i + 1}
                  </span>
                ))}
              </div>
              <pre className="code-content">
                <code>{selectedCode}</code>
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default GitHubCodeExplorer;
