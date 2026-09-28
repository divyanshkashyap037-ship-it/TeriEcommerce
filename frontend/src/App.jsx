import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import SiteLoader from './components/SiteLoader';
import CRTWarp from './components/bits/CRTWarp';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductForm from './pages/ProductForm';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Preloader shown while the site finishes loading. */}
          <SiteLoader />
          {/* Permanent site background: CRTWarp green phosphor on white. */}
          <div className="warp-bg" aria-hidden="true">
            <CRTWarp
              color="#10B981"
              backgroundColor="#ffffff"
              speed={0.5}
              curvature={0.25}
              scanlineStrength={0.25}
              scanlineFrequency={200}
              waveAmplitude={0.3}
              waveFrequency={2.5}
              bloom={1.5}
              bloomRadius={1}
              noise={0.1}
              vignette={0}
              brightness={1.25}
              pixelation={1}
              rgbShift={0.015}
              mouseReact
              mouseStrength={0.5}
              dpr={1}
              fps={30}
            />
          </div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/products" element={<Navigate to="/shop" replace />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/products/new"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id/edit"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
