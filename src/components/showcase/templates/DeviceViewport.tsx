import React, { useState, useRef } from 'react';
import './DeviceViewport.css';

interface DeviceViewportProps {
  initialUrl?: string;
  projectName: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const DeviceViewport: React.FC<DeviceViewportProps> = ({
  initialUrl = 'https://jarvis282.netlify.app/',
  projectName,
}) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [url, setUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    setUrl(formatted);
    setInputUrl(formatted);
    setIsEditingUrl(false);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`viewport-container device-${device}`}>
      {/* Viewport Toolbar: Monochrome Window Controls & URL Bar on Left, Device Switcher on Right */}
      <div className="viewport-toolbar">
        <div className="toolbar-left">
          {/* Monochrome Window Controls in far left corner */}
          <div className="chrome-dots" title="Window controls">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>

          {/* Sized-to-content URL Box with zero border */}
          <div className="chrome-url-box">
            <form className="chrome-url-form" onSubmit={handleUrlSubmit}>
              <svg className="lock-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isEditingUrl ? (
                <input
                  type="text"
                  className="chrome-url-input"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onBlur={() => setIsEditingUrl(false)}
                  autoFocus
                />
              ) : (
                <span
                  className="chrome-url-text"
                  onClick={() => setIsEditingUrl(true)}
                  title="Click to edit live URL"
                >
                  {url}
                </span>
              )}
            </form>

            <div className="chrome-actions">
              <button className="chrome-action-btn" onClick={handleReload} title="Reload preview">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="chrome-action-btn"
                title="Open in new tab"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Device Switcher (Desktop, Tablet, Mobile) */}
        <div className="device-switcher">
          <button
            className={`device-btn ${device === 'desktop' ? 'is-active' : ''}`}
            onClick={() => setDevice('desktop')}
            title="Desktop View (1440px)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span>Desktop</span>
          </button>

          <button
            className={`device-btn ${device === 'tablet' ? 'is-active' : ''}`}
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <line x1="12" x2="12.01" y1="18" y2="18" />
            </svg>
            <span>Tablet</span>
          </button>

          <button
            className={`device-btn ${device === 'mobile' ? 'is-active' : ''}`}
            onClick={() => setDevice('mobile')}
            title="Mobile View (390px)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Direct Website Viewport - Zero nested cards */}
      <div className="viewport-stage">
        {isLoading && (
          <div className="viewport-loader">
            <div className="loader-spinner" />
            <span>Connecting to {projectName} viewport...</span>
          </div>
        )}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={url}
          className="viewport-iframe"
          title={`${projectName} Live View`}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
export default DeviceViewport;
