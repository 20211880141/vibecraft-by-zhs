'use client';

import { useQuery } from '@tanstack/react-query';
import type { GithubSearchResult, TrendingRepo } from '@/types/github';

async function fetchTrending(): Promise<GithubSearchResult<TrendingRepo>> {
  const res = await fetch('/api/github/trending');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useGithubTrending() {
  return useQuery({
    queryKey: ['github', 'trending'],
    queryFn: fetchTrending,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}