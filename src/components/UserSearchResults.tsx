'use client';

import type { GithubSearchUserItem } from '@/types/github';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface UserSearchResultsProps {
  items: GithubSearchUserItem[];
  totalCount: number;
  query: string;
  onSelect: (username: string) => void;
}

export function UserSearchResults({
  items,
  totalCount,
  query,
  onSelect,
}: UserSearchResultsProps) {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No users found</p>
        <p className="mt-1 text-sm">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Found <span className="font-semibold text-gray-700 dark:text-gray-300">{totalCount}</span> user{totalCount !== 1 ? 's' : ''} for &quot;<span className="font-medium">{query}</span>&quot;
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((user) => (
          <button
            key={user.login}
            onClick={() => onSelect(user.login)}
            className="w-full text-left animate-fade-in-up"
          >
            <Card hover className="flex items-center gap-4 p-4">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-12 w-12 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {user.login}
                </p>
                <Badge variant="secondary">{user.type}</Badge>
              </div>
              <svg className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}