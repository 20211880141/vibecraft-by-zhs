'use client';

import { useQuery } from '@tanstack/react-query';
import type { GithubRepo } from '@/types/github';

async function fetchRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `/api/github/repos?user=${encodeURIComponent(username)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useGithubRepos(username: string) {
  return useQuery({
    queryKey: ['github', 'repos', username],
    queryFn: () => fetchRepos(username),
    enabled: username.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}