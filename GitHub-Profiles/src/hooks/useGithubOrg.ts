'use client';

import { useQuery } from '@tanstack/react-query';
import type { GithubSearchResult, GithubSearchUserItem } from '@/types/github';

async function searchOrgs(query: string): Promise<GithubSearchResult<GithubSearchUserItem>> {
  const res = await fetch(`/api/github/orgs?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useGithubOrg(query: string) {
  return useQuery({
    queryKey: ['github', 'orgs', query],
    queryFn: () => searchOrgs(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}