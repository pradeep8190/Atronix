import React, { useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  onNavigate?: (page: 'home' | 'components' | 'templates') => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenSearch }) => {
  const navItems = ['Components', 'Templates', 'Pricing', 'Docs'];

  // Cmd+K / Ctrl+K shortcut to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <span
          className="navbar-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate?.('home')}
        >
          Atronix UI
        </span>
        <div className="navbar-links">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="nav-link"
              onClick={(e) => {
                if (item === 'Components') {
                  e.preventDefault();
                  onNavigate?.('components');
                } else if (item === 'Templates') {
                  e.preventDefault();
                  onNavigate?.('templates');
                }
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        {/* Interactive Expanding Liquid Glass Search Trigger */}
        <div
          className="nav-search-wrapper"
          onClick={() => onOpenSearch?.()}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenSearch?.();
            }
          }}
        >
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <span
            style={{
              fontSize: '12.5px',
              color: 'rgba(255, 255, 255, 0.48)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            Search...
          </span>

          <kbd className="search-badge">⌘K</kbd>
        </div>

        {/* Cart Icon Button */}
        <button className="nav-icon-btn" aria-label="Shopping Cart">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>

        {/* Moon / Theme Toggle Icon Button */}
        <button className="nav-icon-btn" aria-label="Toggle Theme">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        {/* Vertical Divider */}
        <div className="nav-divider" />

        {/* Login Link */}
        <a href="#login" className="nav-login-link">
          Login
        </a>

        {/* CTA Button: Get Pro */}
        <button className="nav-cta-button">
          <span>Get Pro</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
