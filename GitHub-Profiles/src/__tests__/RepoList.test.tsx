import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RepoList } from '@/components/RepoList';
import type { GithubRepo } from '@/types/github';

const mockRepos: GithubRepo[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  name: `repo-${i}`,
  html_url: `https://github.com/test/repo-${i}`,
  description: `Description for repo ${i}`,
  stargazers_count: 100 - i * 10,
  forks_count: 50 - i * 5,
  language: i % 2 === 0 ? 'TypeScript' : 'Rust',
  topics: i === 0 ? ['react', 'nextjs'] : [],
  updated_at: '2024-01-01T00:00:00Z',
}));

describe('RepoList', () => {
  it('renders at most 4 repos', () => {
    const { container } = render(<RepoList repos={mockRepos} />);
    // Each repo has a link, so anchor count should be at most 4
    const links = container.querySelectorAll('a');
    expect(links.length).toBeLessThanOrEqual(4);
  });

  it('renders repo names', () => {
    render(<RepoList repos={mockRepos} />);
    expect(screen.getByText('repo-0')).toBeInTheDocument();
    expect(screen.getByText('repo-1')).toBeInTheDocument();
  });

  it('handles empty repos array', () => {
    const { container } = render(<RepoList repos={[]} />);
    expect(screen.getByText('Top Repositories')).toBeInTheDocument();
    const grid = container.querySelector('.grid');
    expect(grid?.children.length).toBe(0);
  });

  it('renders stars and forks counts', () => {
    render(<RepoList repos={mockRepos.slice(0, 1)} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders language badges', () => {
    render(<RepoList repos={mockRepos.slice(0, 1)} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});