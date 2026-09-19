export default function EmptyState({ title, children, actions }) {
  return (
    <div className="empty">
      <div className="empty__reel" aria-hidden="true">
        <span /><span /><span />
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}
