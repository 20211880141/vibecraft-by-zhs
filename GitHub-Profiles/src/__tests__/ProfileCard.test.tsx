import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '@/components/ProfileCard';
import type { GithubProfile } from '@/types/github';

const mockProfile: GithubProfile = {
  login: 'vercel',
  avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4',
  name: 'Vercel',
  bio: 'Develop. Preview. Ship.',
  followers: 12000,
  public_repos: 450,
  html_url: 'https://github.com/vercel',
  company: null,
  location: 'San Francisco, CA',
  blog: 'https://vercel.com',
  twitter_username: 'vercel',
};

describe('ProfileCard', () => {
  it('renders user name and login', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('Vercel')).toBeInTheDocument();
    expect(screen.getByText('@vercel')).toBeInTheDocument();
  });

  it('renders bio', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('Develop. Preview. Ship.')).toBeInTheDocument();
  });

  it('renders follower and repo counts', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('12.0k')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('renders location', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('uses login as fallback when name is null', () => {
    const profileWithNoName = { ...mockProfile, name: null };
    render(<ProfileCard profile={profileWithNoName} />);
    expect(screen.getByText('vercel')).toBeInTheDocument();
  });

  it('does not render bio section when bio is null', () => {
    const profileWithNoBio = { ...mockProfile, bio: null };
    const { container } = render(<ProfileCard profile={profileWithNoBio} />);
    // The bio paragraph should not exist
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });
});