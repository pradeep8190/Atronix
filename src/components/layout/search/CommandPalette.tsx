import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './CommandPalette.css';
import { searchCatalog } from '@/lib/search/searchEngine';
import type { SearchDocument, SearchResult } from '@/lib/search/types';
import { HighlightMatch } from './HighlightMatch';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (id: string) => void;
  onSelectTemplate: (id: string) => void;
}

const STORAGE_KEY_RECENTS = 'atronix_search_recents';
const QUICK_TAGS = [
  'Folder',
  'Fluid Mitosis',
  'Mercury Slider',
  'Magnetic Particles',
  'Hydro Button',
  'Pricing Matrix',
  'Volumetric Beam',
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
  onSelectTemplate,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'components' | 'templates'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      try {
        const updated = [
          trimmed,
          ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 6);
        setRecentSearches(updated);
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    },
    [recentSearches]
  );

  const removeRecentSearch = useCallback(
    (e: React.MouseEvent, term: string) => {
      e.stopPropagation();
      try {
        const updated = recentSearches.filter((s) => s !== term);
        setRecentSearches(updated);
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    },
    [recentSearches]
  );

  const clearAllRecents = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENTS);
    } catch {
      // Ignore
    }
  }, []);

  // Compute search results with engine
  const searchResponse = useMemo(() => {
    return searchCatalog(query);
  }, [query]);

  // Filter results by selected category tab
  const filteredResults = useMemo(() => {
    if (filter === 'all') return searchResponse.results;
    if (filter === 'components') return searchResponse.results.filter((r) => r.item.type === 'component');
    return searchResponse.results.filter((r) => r.item.type === 'template');
  }, [searchResponse.results, filter]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filter]);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Selection & Navigation handler
  const handleSelectItem = useCallback(
    (item: SearchDocument) => {
      saveRecentSearch(item.name);
      onClose();
      if (item.type === 'template') {
        onSelectTemplate(item.id);
      } else {
        onSelectComponent(item.id);
      }
    },
    [onClose, onSelectComponent, onSelectTemplate, saveRecentSearch]
  );

  // Copy CLI command handler
  const handleCopyCli = useCallback(
    (e: React.MouseEvent | KeyboardEvent, item: SearchDocument) => {
      e.stopPropagation();
      const cmd = item.cliCommand || `npx atronix add ${item.id}`;
      navigator.clipboard.writeText(cmd);
    },
    []
  );

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredResults.length === 0 ? 0 : Math.min(prev + 1, filteredResults.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredResults.length === 0 ? 0 : Math.max(prev - 1, 0)
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectItem(filteredResults[selectedIndex].item);
        }
      } else if (e.key === 'Tab' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleCopyCli(e, filteredResults[selectedIndex].item);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, handleSelectItem, handleCopyCli, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.cmd-result-item.selected') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Search Input Bar — Zero icons, pure liquid glass field */}
        <div className="cmd-header">
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type anything to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query ? (
            <button
              className="cmd-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="cmd-esc-badge" onClick={onClose}>
              esc
            </span>
          )}
        </div>

        {/* Category Filters Bar — Smooth fluid glass pills */}
        <div className="cmd-filters-bar">
          <button
            className={`cmd-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`cmd-filter-pill ${filter === 'components' ? 'active' : ''}`}
            onClick={() => setFilter('components')}
          >
            Components
          </button>
          <button
            className={`cmd-filter-pill ${filter === 'templates' ? 'active' : ''}`}
            onClick={() => setFilter('templates')}
          >
            Templates
          </button>
        </div>

        {/* "Did you mean?" intelligent suggestion */}
        {searchResponse.didYouMean && (
          <div className="cmd-suggestion-banner">
            <span>Did you mean</span>
            <button
              className="cmd-suggestion-btn"
              onClick={() => {
                if (searchResponse.didYouMean) {
                  setQuery(searchResponse.didYouMean.text);
                }
              }}
            >
              {searchResponse.didYouMean.text}?
            </button>
          </div>
        )}

        {/* Results / Recents / Trending Area */}
        <div className="cmd-body" ref={listRef}>
          {query.trim() === '' ? (
            /* Empty State with Recents & Quick Trending */
            <div>
              {recentSearches.length > 0 && (
                <div>
                  <div className="cmd-section-title">
                    <span>Recent Searches</span>
                    <button className="cmd-clear-recents" onClick={clearAllRecents}>
                      clear
                    </button>
                  </div>
                  <div className="cmd-chips-row">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="cmd-chip"
                        onClick={() => setQuery(term)}
                      >
                        <span>{term}</span>
                        <button
                          className="cmd-chip-remove"
                          onClick={(e) => removeRecentSearch(e, term)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cmd-section-title">
                <span>Trending</span>
              </div>
              <div className="cmd-chips-row">
                {QUICK_TAGS.map((tag) => (
                  <div
                    key={tag}
                    className="cmd-chip"
                    onClick={() => setQuery(tag)}
                  >
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            /* Results list */
            filteredResults.map((result: SearchResult, idx: number) => {
              const { item, highlights, matchedField, matchedValue } = result;
              const isSelected = idx === selectedIndex;
              const nameHighlight = highlights.find((h) => h.field === 'name');

              return (
                <div
                  key={item.id}
                  className={`cmd-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-left">
                    <div className="cmd-item-info">
                      <div className="cmd-item-header">
                        <HighlightMatch
                          text={item.name}
                          indices={nameHighlight?.indices}
                          className="cmd-item-title"
                        />
                        <span className={`cmd-item-badge ${item.type}`}>
                          {item.category}
                        </span>

                        {matchedField === 'aliases' && (
                          <span className="cmd-matched-badge">
                            {matchedValue}
                          </span>
                        )}
                      </div>

                      <div className="cmd-item-desc">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="cmd-item-actions">
                    <button
                      className="cmd-copy-cli-btn"
                      onClick={(e) => handleCopyCli(e, item)}
                      title="Copy CLI command"
                    >
                      copy cli
                    </button>
                    <span className="cmd-enter-hint">↵</span>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty Search Results */
            <div className="cmd-empty">
              <div className="cmd-empty-title">No matching results</div>
              <div className="cmd-empty-desc">
                Try searching for <strong>folder</strong>, <strong>slider</strong>, <strong>fluid</strong>, or <strong>pricing</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Minimalist Keyboard Hints — Zero borders */}
        <div className="cmd-footer">
          <div className="cmd-footer-hints">
            <span className="cmd-footer-hint">
              <kbd className="cmd-footer-kbd">↑↓</kbd> navigate
            </span>
            <span className="cmd-footer-hint">
              <kbd className="cmd-footer-kbd">↵</kbd> select
            </span>
            <span className="cmd-footer-hint">
              <kbd className="cmd-footer-kbd">tab</kbd> copy cli
            </span>
            <span className="cmd-footer-hint">
              <kbd className="cmd-footer-kbd">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
