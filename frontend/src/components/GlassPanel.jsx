import GlassSurface from './bits/GlassSurface';

// House glass preset — the exact frost as the navbar — so every panel
// matches without repeating props. One GlassSurface per panel.
export default function GlassPanel({ children, radius = 16 }) {
  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={radius}
      backgroundOpacity={0.45}
      saturation={1.5}
    >
      <div style={{ width: '100%', padding: '6px' }}>{children}</div>
    </GlassSurface>
  );
}
