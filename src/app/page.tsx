'use client';

import { useState, useCallback } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchHistory } from '@/components/SearchHistory';
import { EmptyState } from '@/components/EmptyState';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SearchModeTabs } from '@/components/SearchModeTabs';
import { UserSearchResults } from '@/components/UserSearchResults';
import { RepoSearchResults } from '@/components/RepoSearchResults';
import { OrgSearchResults } from '@/components/OrgSearchResults';
import { TrendingRepos } from '@/components/TrendingRepos';
import {
  ProfileCardSkeleton,
  RepoListSkeleton,
} from '@/components/ui/Skeleton';
import { useGithubProfile } from '@/hooks/useGithubProfile';
import { useGithubRepos } from '@/hooks/useGithubRepos';
import { useGithubSearchUsers } from '@/hooks/useGithubSearchUsers';
import { useGithubSearchRepos } from '@/hooks/useGithubSearchRepos';
import { useGithubOrg } from '@/hooks/useGithubOrg';
import { useGithubTrending } from '@/hooks/useGithubTrending';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import type { SearchMode } from '@/types/github';
import {
  SEARCH_MODE_LABELS,
  SEARCH_MODE_PLACEHOLDERS,
  SEARCH_MODE_HINTS,
} from '@/types/github';

export default function Home() {
  const [searchedUser, setSearchedUser] = useState('');
  const [mode, setMode] = useState<SearchMode>('users');
  // 每个模式独立存储搜索词
  const [queries, setQueries] = useState<Record<SearchMode, string>>({
    users: '',
    repos: '',
    orgs: '',
    trending: '',
  });
  const { add } = useSearchHistory();

  const currentQuery = queries[mode];

  const profile = useGithubProfile(searchedUser);
  const repos = useGithubRepos(searchedUser);
  const searchUsers = useGithubSearchUsers(mode === 'users' ? currentQuery : '');
  const searchRepos = useGithubSearchRepos(mode === 'repos' ? currentQuery : '');
  const orgResults = useGithubOrg(mode === 'orgs' ? currentQuery : '');
  const trending = useGithubTrending();

  const handleSearch = useCallback(
    (query: string) => {
      setQueries(prev => ({ ...prev, [mode]: query }));
      add(query);
    },
    [mode, add],
  );

  const handleModeChange = useCallback((newMode: SearchMode) => {
    setMode(newMode);
    setSearchedUser('');
  }, []);

  const handleSelectUser = useCallback(
    (username: string) => {
      setSearchedUser(username);
      setMode('users');
    },
    [],
  );

  const isLoading =
    profile.isLoading ||
    repos.isLoading ||
    searchUsers.isLoading ||
    searchRepos.isLoading ||
    orgResults.isLoading ||
    trending.isLoading;

  const error =
    profile.error ??
    repos.error ??
    searchUsers.error ??
    searchRepos.error ??
    orgResults.error ??
    trending.error;

  // Determine if SearchBar should be visible
  const showSearchBar = mode !== 'trending';
  const placeholder = SEARCH_MODE_PLACEHOLDERS[mode];
  const hint = SEARCH_MODE_HINTS[mode];

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      <header className="mb-10 mt-2 flex items-center justify-between">
        <div>
          <h1 className="gradient-text text-3xl font-bold tracking-tight">
            GitHub Profiles
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        {/* Mode Tabs */}
        <div className="mb-6">
          <SearchModeTabs active={mode} onChange={handleModeChange} />
        </div>

        {/* Search Bar */}
        {showSearchBar && (
          <SearchBar
            key={mode}
            defaultValue={currentQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder={placeholder}
          />
        )}

        {/* No search yet — show search history or empty state */}
        {mode !== 'trending' && !currentQuery && (searchedUser ? !profile.data : true) && (
          <>
            {!searchedUser && <SearchHistory onSelect={handleSearch} />}
            {!searchedUser && !isLoading && <EmptyState />}
          </>
        )}

        {/* Error */}
        {error && (
          <ErrorAlert
            message={error.message}
            onRetry={() => handleSearch(currentQuery)}
          />
        )}

        {/* User Profile Detail View (when a user is selected from search) */}
        {searchedUser && profile.isLoading && (
          <>
            <ProfileCardSkeleton />
            <RepoListSkeleton />
          </>
        )}
        {searchedUser && !profile.isLoading && !error && profile.data && (
          <>
            <ProfileCard profile={profile.data} />
            {repos.data && <RepoList repos={repos.data} />}
          </>
        )}

        {/* Mode: Users keyword search */}
        {mode === 'users' &&
          currentQuery &&
          !searchedUser &&
          searchUsers.data && (
            <UserSearchResults
              items={searchUsers.data.items}
              totalCount={searchUsers.data.total_count}
              query={currentQuery}
              onSelect={handleSelectUser}
            />
          )}

        {/* Mode: Repos keyword search */}
        {mode === 'repos' && currentQuery && searchRepos.data && (
          <RepoSearchResults
            items={searchRepos.data.items}
            totalCount={searchRepos.data.total_count}
            query={currentQuery}
          />
        )}

        {/* Mode: Orgs keyword search */}
        {mode === 'orgs' && currentQuery && orgResults.data && (
          <OrgSearchResults
            items={orgResults.data.items}
            totalCount={orgResults.data.total_count}
            query={currentQuery}
          />
        )}

        {/* Mode: Trending */}
        {mode === 'trending' && (
          <TrendingRepos
            items={trending.data?.items ?? []}
            isLoading={trending.isLoading}
            error={trending.error}
          />
        )}
      </main>

      <footer className="glass-card mt-12 rounded-2xl border-t-0 p-5 text-center text-sm text-gray-400 dark:text-gray-500">
        <span>
          Powered by{' '}
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
          >
            GitHub API
          </a>
          {' · '}Built with Next.js & React Query
        </span>
      </footer>
    </div>
  );
}