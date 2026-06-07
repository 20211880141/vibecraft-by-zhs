'use client';

import type { SearchMode } from '@/types/github';
import { SEARCH_MODE_LABELS } from '@/types/github';

interface SearchModeTabsProps {
  active: SearchMode;
  onChange: (mode: SearchMode) => void;
}

export function SearchModeTabs({ active, onChange }: SearchModeTabsProps) {
  const modes: SearchMode[] = ['users', 'repos', 'orgs', 'trending'];

  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-gray-100/60 p-1.5 shadow-inner backdrop-blur-sm dark:bg-gray-800/60">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`pill-tab ${
            active === mode ? 'pill-tab-active' : 'pill-tab-inactive'
          }`}
        >
          {SEARCH_MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );
}