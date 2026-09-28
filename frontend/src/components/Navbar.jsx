import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import SpecularButton from './bits/SpecularButton';
import GlassSurface from './bits/GlassSurface';
import logo from '../assets/logo.png';

// Whole nav sits inside a GlassSurface. Transparent outer wrapper sticks;
// logo image is centered via a 3-column grid.
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const isSeller = user?.role === 'seller';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const glassBtn = {
    size: 'sm',
    radius: 999,
    tint: '#ffffff',
    tintOpacity: 0.45,
    blur: 6,
    textColor: '#14532d',
    lineColor: '#2fbf71',
    baseColor: '#7a9a83',
  };

  return (
    <header className="nav-wrap">
      <GlassSurface
        width="100%"
        borderRadius={18}
        backgroundOpacity={0.32}
        saturation={1.4}
        brightness={55}
      >
        <nav className="navbar">
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            {isSeller && <Link to="/products/new">Sell</Link>}
          </div>

          <Link to="/" className="brand-img" aria-label="Teri home">
            <img src={logo} alt="Teri" />
          </Link>

          <div className="nav-links nav-right">
            <Link to="/cart">Cart{count > 0 ? ` (${count})` : ''}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile">Profile</Link>
                <span className="user-email">{user?.name} ({user?.role})</span>
                <SpecularButton {...glassBtn} onClick={handleLogout}>
                  Logout
                </SpecularButton>
              </>
            ) : (
              <>
                <SpecularButton {...glassBtn} onClick={() => navigate('/login')}>
                  Login
                </SpecularButton>
                <SpecularButton {...glassBtn} onClick={() => navigate('/register')}>
                  Sign up
                </SpecularButton>
              </>
            )}
          </div>
        </nav>
      </GlassSurface>
    </header>
  );
}
