import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scroll to the top on page changes only. Filter changes (query string) keep their place.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
