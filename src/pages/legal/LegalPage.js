import useDocumentTitle from '../../hooks/useDocumentTitle';
import { SITE } from '../../config';

export default function LegalPage({ title, children }) {
  useDocumentTitle(title);
  return (
    <article className="wrap page page--narrow legal">
      <h1 className="h-page">{title}</h1>
      <p className="muted small">Last updated {SITE.legalUpdated}</p>
      {children}
    </article>
  );
}
