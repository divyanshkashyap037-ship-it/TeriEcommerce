import api from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fisher-Yates: picks a random set of featured products on every visit.
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Probe with crossOrigin so a failure here matches how WebGL would fail.
// The browser caches the image, so the carousel paints instantly afterwards.
function probeImage(src, timeout = 6000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), timeout);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = src;
  });
}

let featuredPromise = null;

// Single shared fetch + image preload. The site loader awaits it, Home reuses
// the same promise — data and pixels are ready before the loader lifts.
export default function loadFeatured() {
  if (featuredPromise) return featuredPromise;
  featuredPromise = api
    .get('/api/products', { timeout: 5000 })
    .then(async (res) => {
      const items = shuffle(
        (res.data.products || [])
          .filter((p) => p.image)
          .map((p) => ({
            // Proxied so every host (pinimg, gstatic, ...) is CORS-clean for WebGL.
            src: `${API_BASE}/api/products/image-proxy?url=${encodeURIComponent(p.image)}`,
            alt: p.name,
            title: p.name,
            subtitle: `₹${p.price}`,
          }))
      ).slice(0, 10);
      const checked = await Promise.all(
        items.map(async (item) => ((await probeImage(item.src)) ? item : null))
      );
      return checked.filter(Boolean);
    })
    .catch(() => []); // backend down -> carousel falls back to sample photos
  return featuredPromise;
}
