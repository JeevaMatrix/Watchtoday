import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SETTINGS_KEY, readJSON, writeJSON } from '../lib/storage';
import { detectRegion } from '../lib/regions';

const Ctx = createContext({ region: 'US', setRegion: () => {} });

export function SettingsProvider({ children }) {
  const [region, setRegionState] = useState(() => {
    const saved = readJSON(SETTINGS_KEY, {});
    return typeof saved.region === 'string' && /^[A-Z]{2}$/.test(saved.region) ? saved.region : detectRegion();
  });

  const setRegion = useCallback((code) => {
    setRegionState(code);
    writeJSON(SETTINGS_KEY, { region: code });
  }, []);

  const value = useMemo(() => ({ region, setRegion }), [region, setRegion]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
