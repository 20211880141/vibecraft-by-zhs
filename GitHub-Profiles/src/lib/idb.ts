import { get, set, del, keys } from 'idb-keyval';
import type { SearchRecord } from '@/types/github';

const HISTORY_KEY = 'search-history';
const MAX_HISTORY = 10;

export async function addSearchHistory(username: string): Promise<SearchRecord[]> {
  const history = await getSearchHistory();
  const filtered = history.filter((r) => r.username !== username);
  const record: SearchRecord = { username, timestamp: Date.now() };
  const updated = [record, ...filtered].slice(0, MAX_HISTORY);
  await set(HISTORY_KEY, updated);
  return updated;
}

export async function getSearchHistory(): Promise<SearchRecord[]> {
  const storeKeys = await keys();
  if (!storeKeys.includes(HISTORY_KEY)) return [];
  return (await get(HISTORY_KEY)) ?? [];
}

export async function clearSearchHistory(): Promise<void> {
  await del(HISTORY_KEY);
}

export async function removeSearchHistoryItem(username: string): Promise<SearchRecord[]> {
  const history = await getSearchHistory();
  const updated = history.filter((r) => r.username !== username);
  await set(HISTORY_KEY, updated);
  return updated;
}