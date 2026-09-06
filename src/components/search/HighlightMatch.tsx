import React from 'react';

interface HighlightMatchProps {
  text: string;
  indices?: Array<[number, number]>;
  className?: string;
  highlightClassName?: string;
}

export const HighlightMatch: React.FC<HighlightMatchProps> = ({
  text,
  indices,
  className = '',
  highlightClassName = 'cmd-highlight',
}) => {
  if (!indices || indices.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Merge and sort overlapping ranges
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];

  for (const [start, end] of sorted) {
    if (merged.length === 0) {
      merged.push([Math.max(0, start), Math.min(text.length - 1, end)]);
    } else {
      const prev = merged[merged.length - 1];
      if (start <= prev[1] + 1) {
        prev[1] = Math.max(prev[1], Math.min(text.length - 1, end));
      } else {
        merged.push([Math.max(0, start), Math.min(text.length - 1, end)]);
      }
    }
  }

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  merged.forEach(([start, end], idx) => {
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    nodes.push(
      <span key={`hl-${idx}`} className={highlightClassName}>
        {text.slice(start, end + 1)}
      </span>
    );
    lastIndex = end + 1;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <span className={className}>{nodes}</span>;
};

export default HighlightMatch;
