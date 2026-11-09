import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSettings, type Settings } from '../db/repo';
import { money } from '../utils/format';

type Ctx = {
  settings: Settings;
  ready: boolean;
  reload: () => Promise<void>;
  fmt: (n: number) => string;
};

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  reload: async () => {},
  fmt: n => money(n),
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    setSettings(await getSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const fmt = useCallback((n: number) => money(n, settings.currency), [settings.currency]);

  return <SettingsContext.Provider value={{ settings, ready, reload, fmt }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
