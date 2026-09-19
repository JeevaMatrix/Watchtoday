import { useEffect, useState } from 'react';

// Runs an async function whenever deps change and ignores stale results.
export default function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then(
        (data) => { if (!cancelled) setState({ data, error: null, loading: false }); },
        (error) => { if (!cancelled) setState({ data: null, error, loading: false }); },
      );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
