import React from 'react';
import './ShowcaseFooter.css';

interface ShowcaseFooterProps {
  CustomFooter?: React.ComponentType<any>;
}

export const ShowcaseFooter: React.FC<ShowcaseFooterProps> = ({ CustomFooter }) => {
  return (
    <footer className="showcase-footer">
      {/* Component-Specific Custom Footer (e.g., FolderFooter for Frost Vault) */}
      {CustomFooter && <CustomFooter />}

      {/* Universal Footer Bottom Branding & Quick Links Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-brand">
          <span className="brand-dot" />
          <span className="brand-text">Atronix UI</span>
          <span className="brand-divider">•</span>
          <span className="brand-tagline">Engineered with Liquid Glass & Spring Physics</span>
        </div>

        <div className="footer-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="footer-link-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="footer-link-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit Page
          </a>
        </div>
      </div>
    </footer>
  );
};

export default ShowcaseFooter;
