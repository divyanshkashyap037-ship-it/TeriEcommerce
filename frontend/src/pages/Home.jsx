import { useEffect, useRef, useState } from 'react';
import FlexCarousel from '../components/bits/FlexCarousel';
import loadFeatured from '../services/featured';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState(null); // null = still fetching
  const [nearView, setNearView] = useState(false); // close enough -> preload carousel
  const [inView, setInView] = useState(false); // actually on screen -> reveal
  const sectionRef = useRef(null);

  // Reuse the promise the site loader already awaited: data + image pixels
  // are normally cached by the time Home mounts.
  useEffect(() => {
    let alive = true;
    loadFeatured().then((items) => {
      if (alive) setFeatured(items);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Two-stage reveal: preload the carousel 600px before it arrives so images
  // and the intro are ready, then reveal it as soon as any of it is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          preload.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.01 }
    );
    preload.observe(el);
    reveal.observe(el);
    return () => {
      preload.disconnect();
      reveal.disconnect();
    };
  }, []);

  return (
    <>
      <div className="container" style={{ maxWidth: 1200 }}>
        <section className="home-hero">
          <h1 className="home-hero-title">TERIECOMMERCE</h1>
        </section>
      </div>

      {/* Full-bleed: sits outside the container so it touches both screen edges. */}
      <section
        className="home-featured"
        ref={sectionRef}
        data-show={inView ? '' : undefined}
      >
        <h2 className="home-featured-title">Featured products</h2>
        <div className="home-featured-veil">
          {nearView && featured !== null && (
            <FlexCarousel
              items={featured}
              preset="arch"
              intro="rise"
              cardHeight={0.55}
              gap={12}
              squeeze={0.2}
              focusOnClick
              captions
              captureWheel={false}
              lensWidth={0.8}
              lensHeight={0.8}
              tilt={0}
              bend={0.3}
              reach={0.36}
              curl="rise"
              dispersion={0.4}
            />
          )}
        </div>
      </section>
    </>
  );
}
