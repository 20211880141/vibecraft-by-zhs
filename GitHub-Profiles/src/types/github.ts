/** GitHub 用户档案 */
export interface GithubProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string;
  twitter_username: string | null;
}

/** GitHub 仓库 */
export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
}

/** GitHub 组织 */
export interface GithubOrganization {
  login: string;
  avatar_url: string;
  name: string | null;
  description: string | null;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string;
  email: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
  updated_at: string;
  twitter_username: string | null;
}

/** GitHub 搜索结果包装 */
export interface GithubSearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

/** 搜索结果中的用户项（比完整 Profile 多 score） */
export interface GithubSearchUserItem {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  score: number;
}

/** 搜索结果中的仓库项 */
export interface GithubSearchRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

/** 热门趋势仓库 */
export interface TrendingRepo extends GithubRepo {
  full_name?: string;
  owner?: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  /** 今日新增 star 数（来自 GitHub Trending 页面） */
  stars_today?: number;
}

/** API 统一响应 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/** 搜索历史记录项 */
export interface SearchRecord {
  username: string;
  timestamp: number;
}

/** 搜索模式 */
export type SearchMode = 'users' | 'repos' | 'orgs' | 'trending';

/** 搜索模式的元信息 */
export const SEARCH_MODE_LABELS: Record<SearchMode, string> = {
  users: 'Users',
  repos: 'Repositories',
  orgs: 'Organizations',
  trending: 'Trending',
};

export const SEARCH_MODE_PLACEHOLDERS: Record<SearchMode, string> = {
  users: 'Search GitHub users by keyword...',
  repos: 'Search repositories by keyword...',
  orgs: 'Search organizations by keyword...',
  trending: '',
};

export const SEARCH_MODE_HINTS: Record<SearchMode, string> = {
  users: 'Search for GitHub users by username, name, or location',
  repos: 'Search for repositories by name, description, or topics',
  orgs: 'Search for organizations by name',
  trending: 'Explore trending repositories on GitHub',
};