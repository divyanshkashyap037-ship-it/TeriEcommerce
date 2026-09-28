import { useEffect, useState } from 'react';
import loadFeatured from '../services/featured';
import './SiteLoader.css';

// Full-screen preloader: holds until the window is loaded AND the featured
// products (data + image pixels) are cached, so nothing pops in after the
// loader lifts. Fallback timeout so a slow asset can never trap the page.
export default function SiteLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const winLoad = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    const beat = new Promise((resolve) => setTimeout(resolve, 700)); // brand beat
    let fade;
    const hide = () => {
      fade = setTimeout(() => setDone(true), 150);
    };
    Promise.all([winLoad, beat, loadFeatured()]).then(hide, hide);
    const fallback = setTimeout(hide, 7000);
    return () => {
      clearTimeout(fade);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className={`site-loader${done ? ' is-done' : ''}`} aria-hidden="true">
      <div className="site-loader-inner">
        <span className="site-loader-brand">teri</span>
        <span className="site-loader-bar">
          <i />
        </span>
        <span className="site-loader-hint">loading store…</span>
      </div>
    </div>
  );
}
