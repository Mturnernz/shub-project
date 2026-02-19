import { useState, useCallback } from 'react';

interface UseSavedIndicatorReturn {
  saved: boolean;
  saving: boolean;
  triggerSave: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

export function useSavedIndicator(displayDuration = 2000): UseSavedIndicatorReturn {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const triggerSave = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), displayDuration);
      return result;
    } finally {
      setSaving(false);
    }
  }, [displayDuration]);

  return { saved, saving, triggerSave };
}
