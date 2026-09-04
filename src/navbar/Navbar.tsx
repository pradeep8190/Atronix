import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  onNavigate?: (page: 'home' | 'components' | 'templates') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const navItems = ['Components', 'Templates', 'Pricing', 'Docs'];
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        {/* Interactive Expanding Liquid Glass Search Input */}
        <div
          className={`nav-search-wrapper ${isFocused || searchQuery ? 'focused' : ''}`}
          onClick={() => searchInputRef.current?.focus()}
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

          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {!isFocused && !searchQuery && <kbd className="search-badge">⌘K</kbd>}
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
