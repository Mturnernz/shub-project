import { useState, useCallback } from 'react';

const STORAGE_KEY = 'shub_saved_workers';

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

export function useSavedWorkers() {
  const [savedIds, setSavedIds] = useState<string[]>(load);

  const toggle = useCallback((workerId: string) => {
    setSavedIds(prev => {
      const next = prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId];
      save(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (workerId: string) => savedIds.includes(workerId),
    [savedIds]
  );

  return { savedIds, toggle, isSaved };
}
