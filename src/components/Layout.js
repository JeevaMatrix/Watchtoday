import { Link, NavLink } from 'react-router-dom';
import Icon, { BrandMark } from './Icons';
import { SITE, TMDB_LOGO_SRC, TMDB_NOTICE, TMDB_SITE } from '../config';

export function Header() {
  return (
    <header className="topbar">
      <div className="wrap topbar__row">
        <Link to="/" className="brand" aria-label={`${SITE.name} home`}>
          <BrandMark />
          <span>{SITE.name}</span>
        </Link>
        <nav className="topnav" aria-label="Main">
          <NavLink to="/" end>Library</NavLink>
          <NavLink to="/add">Add</NavLink>
          <NavLink to="/tonight">Tonight</NavLink>
        </nav>
        <NavLink to="/settings" className="icon-btn topbar__settings" aria-label="Settings and data">
          <Icon name="sliders" />
        </NavLink>
      </div>
    </header>
  );
}

export function BottomNav() {
  const tabs = [
    ['/', 'Library', 'grid', true],
    ['/add', 'Add', 'plus', false],
    ['/tonight', 'Tonight', 'moon', false],
    ['/settings', 'Settings', 'sliders', false],
  ];
  return (
    <nav className="bottomnav" aria-label="Main">
      {tabs.map(([to, label, icon, end]) => (
        <NavLink key={to} to={to} end={end}>
          <Icon name={icon} size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__about">
          <Link to="/" className="brand brand--small" aria-label={`${SITE.name} home`}>
            <BrandMark size={24} />
            <span>{SITE.name}</span>
          </Link>
          <p>Your list stays in your browser. No accounts, no ads, no tracking.</p>
        </div>
        <nav className="footer__links" aria-label="About and legal">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms and conditions</Link>
          <Link to="/cookies">Cookies and storage</Link>
          <Link to="/credits">Credits and disclaimer</Link>
        </nav>
        <div className="footer__tmdb">
          {TMDB_LOGO_SRC && (
            <a href={TMDB_SITE} target="_blank" rel="noopener noreferrer">
              <img src={TMDB_LOGO_SRC} alt="TMDB" height="14" />
            </a>
          )}
          <p>{TMDB_NOTICE} Streaming data from JustWatch.</p>
          <p className="footer__copy">© {SITE.year} {SITE.owner}</p>
        </div>
      </div>
    </footer>
  );
}
