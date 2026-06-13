'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem,
} from '@/lib/idb';
import type { SearchRecord } from '@/types/github';

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSearchHistory().then((data) => {
      setHistory(data);
      setLoaded(true);
    });
  }, []);

  const add = useCallback(async (username: string) => {
    const updated = await addSearchHistory(username);
    setHistory(updated);
  }, []);

  const clear = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const remove = useCallback(async (username: string) => {
    const updated = await removeSearchHistoryItem(username);
    setHistory(updated);
  }, []);

  return { history, loaded, add, clear, remove };
}