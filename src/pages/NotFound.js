import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="wrap page">
      <EmptyState
        title="That page isn’t here"
        actions={<Link className="btn btn--primary" to="/">Back to your library</Link>}
      >
        The link may be old or mistyped.
      </EmptyState>
    </div>
  );
}
