'use client';

import { useQuery } from '@tanstack/react-query';
import type { GithubProfile } from '@/types/github';

async function fetchProfile(username: string): Promise<GithubProfile> {
  const res = await fetch(`/api/github?user=${encodeURIComponent(username)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useGithubProfile(username: string) {
  return useQuery({
    queryKey: ['github', 'profile', username],
    queryFn: () => fetchProfile(username),
    enabled: username.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}