'use client';

import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from './ui/Button';

interface SearchHistoryProps {
  onSelect: (username: string) => void;
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { history, loaded, clear } = useSearchHistory();

  if (!loaded || history.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Recent searches
        </h3>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {history.map((record) => (
          <button
            key={record.username}
            onClick={() => onSelect(record.username)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200/50 bg-white/50 px-3.5 py-1.5 text-sm text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-300/50 hover:bg-emerald-50/50 hover:text-emerald-700 dark:border-gray-700/40 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:border-emerald-600/30 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {record.username}
          </button>
        ))}
      </div>
    </div>
  );
}