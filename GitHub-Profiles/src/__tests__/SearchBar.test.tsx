import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('renders input and search button', () => {
    render(<SearchBar onSearch={() => {}} isLoading={false} />);
    expect(
      screen.getByPlaceholderText('Search GitHub username...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('calls onSearch with trimmed username on submit', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText('Search GitHub username...');
    await user.type(input, '  vercel  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('vercel');
  });

  it('does not call onSearch with empty input', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('disables button and input when loading', () => {
    render(<SearchBar onSearch={() => {}} isLoading={true} />);

    expect(
      screen.getByPlaceholderText('Search GitHub username...'),
    ).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onSearch when Enter key is pressed', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText('Search GitHub username...');
    await user.type(input, 'vercel');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('vercel');
  });
});