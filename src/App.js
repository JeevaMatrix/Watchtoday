import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomNav, Footer, Header } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Enricher from './components/Enricher';
import Home from './pages/Home';
import Add from './pages/Add';
import Details, { LegacyRedirect } from './pages/Details';
import Tonight from './pages/Tonight';
import SharePage from './pages/Share';
import Settings from './pages/Settings';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Cookies from './pages/legal/Cookies';
import Credits from './pages/legal/Credits';

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <ScrollToTop />
      <Enricher />
      <div className="shell">
        <Header />
        <main id="main" className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<Add />} />
            <Route path="/addnew" element={<Navigate to="/add" replace />} />
            <Route path="/tonight" element={<Tonight />} />
            <Route path="/title/:type/:id" element={<Details />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/:id" element={<LegacyRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <BottomNav />
      </div>
    </>
  );
}
