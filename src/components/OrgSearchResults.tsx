'use client';

import type { GithubSearchUserItem } from '@/types/github';
import { Card } from './ui/Card';

interface OrgSearchResultsProps {
  items: GithubSearchUserItem[];
  totalCount: number;
  query: string;
}

export function OrgSearchResults({
  items,
  totalCount,
  query,
}: OrgSearchResultsProps) {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No organizations found</p>
        <p className="mt-1 text-sm">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Found <span className="font-semibold text-gray-700 dark:text-gray-300">{totalCount}</span> organization{totalCount !== 1 ? 's' : ''} for &quot;<span className="font-medium">{query}</span>&quot;
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((org) => (
          <a
            key={org.login}
            href={org.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block animate-fade-in-up"
          >
            <Card hover className="flex items-center gap-4 p-4">
              <img
                src={org.avatar_url}
                alt={org.login}
                className="h-14 w-14 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {org.login}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Organization
                </p>
              </div>
              <svg className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}