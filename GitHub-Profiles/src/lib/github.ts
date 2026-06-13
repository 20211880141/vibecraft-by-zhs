import type { TrendingRepo } from '@/types/github';

export class GithubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'GithubAPIError';
  }
}

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function githubFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    throw new GithubAPIError('User not found', 404);
  }
  if (res.status === 403) {
    const reset = res.headers.get('X-RateLimit-Reset');
    throw new GithubAPIError(
      `Rate limit exceeded. Resets at ${reset}`,
      429,
    );
  }
  if (!res.ok) {
    throw new GithubAPIError(
      `GitHub API responded with ${res.status}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

export async function fetchGithubUser(username: string) {
  return githubFetch<import('@/types/github').GithubProfile>(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`,
  );
}

export async function fetchGithubRepos(username: string) {
  return githubFetch<import('@/types/github').GithubRepo[]>(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=10`,
  );
}

export async function searchGithubUsers(query: string) {
  return githubFetch<import('@/types/github').GithubSearchResult<import('@/types/github').GithubSearchUserItem>>(
    `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(query)}&per_page=20`,
  );
}

export async function searchGithubRepos(query: string) {
  return githubFetch<import('@/types/github').GithubSearchResult<import('@/types/github').GithubSearchRepoItem>>(
    `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`,
  );
}

export async function fetchGithubOrg(name: string) {
  return githubFetch<import('@/types/github').GithubOrganization>(
    `${GITHUB_API_BASE}/orgs/${encodeURIComponent(name)}`,
  );
}

export async function fetchTrendingRepos() {
  const url = 'https://github.com/trending?since=weekly';
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new GithubAPIError(
      `Failed to fetch trending: ${res.status}`,
      res.status,
    );
  }

  const html = await res.text();
  const items: TrendingRepo[] = [];

  // Parse each trending repo article from the HTML
  const articleRegex =
    /<article\s+class="Box-row"[^>]*>[\s\S]*?<\/article>/gi;
  let articleMatch;

  while ((articleMatch = articleRegex.exec(html)) !== null) {
    const article = articleMatch[0];

    // Extract owner from <span class="text-normal">OWNER /</span>
    const ownerMatch = article.match(
      /<span[^>]*class="[^"]*\btext-normal\b[^"]*"[^>]*>\s*([^<]+?)\s*\/\s*<\/span>/i,
    );
    if (!ownerMatch) continue;
    const owner = ownerMatch[1].trim();

    // Extract repo name (text node after text-normal span, inside the <a> tag)
    const nameMatch = article.match(
      /<span[^>]*class="[^"]*\btext-normal\b[^"]*"[^>]*>[\s\S]*?\/\s*<\/span>\s*([^<]+?)\s*<\/a>/i,
    );
    if (!nameMatch) continue;
    const repoName = nameMatch[1].trim();

    // Extract description
    const descMatch = article.match(
      /<p[^>]*color-fg-muted[^>]*>\s*(.*?)\s*<\/p>/i,
    );
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').trim()
      : null;

    // Extract language
    const langMatch = article.match(
      /<span\s+itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/i,
    );
    const language = langMatch ? langMatch[1].trim() : null;

    // Extract stars count from stargazers link
    const starsMatch = article.match(
      /href="\/[^/]+\/[^/]+\/stargazers"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)\s*<\/a>/i,
    );
    const stargazers_count = starsMatch
      ? parseInt(starsMatch[1].replace(/,/g, ''), 10)
      : 0;

    // Extract forks count from forks link
    const forksMatch = article.match(
      /href="\/[^/]+\/[^/]+\/forks"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)\s*<\/a>/i,
    );
    const forks_count = forksMatch
      ? parseInt(forksMatch[1].replace(/,/g, ''), 10)
      : 0;

    // Extract "stars this week" or "stars today"
    const weekMatch = article.match(
      /(\d[\d,]*)\s+stars\s+(this week|today)/i,
    );
    const starsTrend = weekMatch
      ? parseInt(weekMatch[1].replace(/,/g, ''), 10)
      : 0;

    const fullName = `${owner}/${repoName}`;
    items.push({
      id: stargazers_count + forks_count + Date.now() + items.length,
      name: repoName,
      full_name: fullName,
      html_url: `https://github.com/${fullName}`,
      description,
      stargazers_count,
      forks_count,
      language,
      topics: [],
      updated_at: new Date().toISOString(),
      owner: {
        login: owner,
        avatar_url: `https://github.com/${owner}.png`,
        html_url: `https://github.com/${owner}`,
      },
      stars_today: starsTrend,
    });
  }

  return { total_count: items.length, items };
}