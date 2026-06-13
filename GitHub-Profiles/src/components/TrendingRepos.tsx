'use client';

import Image from 'next/image';
import type { TrendingRepo } from '@/types/github';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TrendingReposProps {
  items: TrendingRepo[];
  isLoading: boolean;
  error: Error | null;
}

export function TrendingRepos({ items, isLoading, error }: TrendingReposProps) {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="glass-card animate-pulse rounded-2xl p-5"
          >
            <div className="mb-2 h-5 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="mb-3 h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">Failed to load trending</p>
        <p className="mt-1 text-sm">Please try again later</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No trending repositories</p>
        <p className="mt-1 text-sm">Check back later for new trending projects</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            🔥 Weekly Hot Repositories
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past 7 days
          </span>
        </div>
        <a
          href="https://github.com/trending?since=weekly"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
        >
          View on GitHub →
        </a>
      </div>
      <div className="space-y-3">
        {items.map((repo, index) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block animate-fade-in-up"
          >
            <Card hover className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex min-w-[2.5rem] flex-col items-center">
                  <span className="text-lg font-bold tabular-nums text-gray-300 dark:text-gray-600">
                    #{index + 1}
                  </span>
                  {index < 3 && (
                    <span className="mt-0.5 text-xs text-emerald-500">▲</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                      {repo.name}
                    </p>
                    {repo.owner && (
                      <span className="truncate text-xs text-gray-400 dark:text-gray-500">
                        by {repo.owner.login}
                      </span>
                    )}
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
                    {repo.stars_today !== undefined && repo.stars_today > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                        {repo.stars_today.toLocaleString()} this week
                      </span>
                    )}
                    {repo.topics &&
                      repo.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="primary">
                          {topic}
                        </Badge>
                      ))}
                  </div>
                </div>
                {repo.owner && (
                  <Image
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    width={36}
                    height={36}
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