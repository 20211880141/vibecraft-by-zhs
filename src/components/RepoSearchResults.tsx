'use client';

import type { GithubSearchRepoItem } from '@/types/github';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface RepoSearchResultsProps {
  items: GithubSearchRepoItem[];
  totalCount: number;
  query: string;
}

export function RepoSearchResults({
  items,
  totalCount,
  query,
}: RepoSearchResultsProps) {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No repositories found</p>
        <p className="mt-1 text-sm">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Found <span className="font-semibold text-gray-700 dark:text-gray-300">{totalCount}</span> repositor{totalCount !== 1 ? 'ies' : 'y'} for &quot;<span className="font-medium">{query}</span>&quot;
      </p>
      <div className="space-y-3">
        {items.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block animate-fade-in-up"
          >
            <Card hover className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                      {repo.full_name}
                    </p>
                  </div>
                  {repo.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        {repo.language}
                      </span>
                    )}
                    <span>★ {repo.stargazers_count.toLocaleString()}</span>
                    <span>⑂ {repo.forks_count.toLocaleString()}</span>
                    {repo.topics &&
                  repo.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic}>
                      {topic}
                    </Badge>
                  ))}
                  </div>
                </div>
                {repo.owner && (
                  <img
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    className="h-9 w-9 flex-shrink-0 rounded-lg"
                  />
                )}
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}