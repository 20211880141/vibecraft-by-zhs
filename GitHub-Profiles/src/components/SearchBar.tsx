'use client';

import { useState, type FormEvent } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
  defaultValue?: string;
  placeholder?: string;
  showSearchButton?: boolean;
}

export function SearchBar({
  onSearch,
  isLoading,
  defaultValue,
  placeholder = 'Search GitHub username...',
  showSearchButton = true,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <div className="relative flex-1">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-12"
          disabled={isLoading}
        />
      </div>
      {showSearchButton && (
        <Button type="submit" disabled={isLoading || !value.trim()}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching
            </span>
          ) : (
            'Search'
          )}
        </Button>
      )}
    </form>
  );
}