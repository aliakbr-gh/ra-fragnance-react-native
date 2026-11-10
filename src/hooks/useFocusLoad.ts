import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { both, T } from '../i18n/labels';

/** Re-runs the loader every time the screen gains focus, so lists stay fresh after edits on other screens. */
export function useFocusLoad<T>(loader: () => Promise<T>, initial: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);

  const refresh = useCallback(async () => {
    try {
      setData(await load());
    } catch (e: any) {
      Alert.alert(both(T.error), e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { data, loading, refresh, setData };
}
