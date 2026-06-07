'use client';

import { useQuery } from '@tanstack/react-query';
import type { GithubSearchResult, GithubSearchRepoItem } from '@/types/github';

async function searchRepos(query: string): Promise<GithubSearchResult<GithubSearchRepoItem>> {
  const res = await fetch(`/api/github/search/repos?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useGithubSearchRepos(query: string) {
  return useQuery({
    queryKey: ['github', 'search', 'repos', query],
    queryFn: () => searchRepos(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}