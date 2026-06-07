import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addSearchHistory, clearSearchHistory } from '@/lib/idb';

// Mock idb-keyval
vi.mock('idb-keyval', () => {
  let store: Record<string, unknown> = {};
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      store[key] = value;
    }),
    del: vi.fn(async (key: string) => {
      delete store[key];
    }),
    keys: vi.fn(async () => Object.keys(store)),
  };
});

describe('search history (IndexedDB)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a search record', async () => {
    const result = await addSearchHistory('vercel');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('vercel');
    expect(result[0].timestamp).toBeGreaterThan(0);
  });

  it('deduplicates usernames', async () => {
    await addSearchHistory('vercel');
    const result = await addSearchHistory('vercel');
    expect(result).toHaveLength(1);
  });

  it('maintains max 10 records', async () => {
    for (let i = 0; i < 12; i++) {
      await addSearchHistory(`user-${i}`);
    }
    const result = await addSearchHistory('last-one');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('clears all history', async () => {
    await addSearchHistory('vercel');
    await addSearchHistory('nextjs');
    await clearSearchHistory();
    // After clearing, adding should start fresh
    const result = await addSearchHistory('fresh');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('fresh');
  });
});