import { useEffect } from 'react';
import { SITE } from '../config';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : SITE.name;
  }, [title]);
}
