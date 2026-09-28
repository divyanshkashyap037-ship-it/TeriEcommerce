# TeriEcommerce — Simple Full-Stack E-Commerce

A beginner-friendly e-commerce platform for college assignment / Sheryians Coding School review.
Real MongoDB + Express REST API with JWT auth, and a React + Vite frontend.

**Live project:** `https://your-deployed-link-here`
**GitHub repo:** `https://github.com/your-username/TeriEcommerce`

## Features

- User register / login / logout / me / refresh-token rotation
- Buyer/seller roles: chosen at register, sellers manage inventory, anyone logged in can buy
- Cart (localStorage) + checkout with address form + order history on profile
- Product CRUD (seller-only create/update/delete) + purchase + orders endpoints
- Pages: / (home), /shop, /cart, /checkout, /profile, /products/new, /products/:id/edit, /login, /register + 404
- Access token (15 min) + Refresh token (7 days, HTTP-only cookie, hashed in DB)
- Field-level validation with express-validator on every body/param/query
- Central error handler with correct status codes (200/201/400/401/403/404/409/500)
- React pages: /register, /login, /products, /products/new, /products/:id/edit + 404
- Protected frontend routes, auto token refresh + retry, no infinite loops
- Responsive clean UI with loading / empty / error states + delete confirmation

## Tech Stack

Backend: Node.js, Express, MongoDB, Mongoose, JWT (jsonwebtoken), bcryptjs, express-validator, cookie-parser, CORS, dotenv, express-rate-limit (login only)
Frontend: React, Vite, React Router, Axios, motion, three, ogl, @hugeicons/react, @hugeicons/core-free-icons
UI: real vendored React Bits components (CRTWarp, DitherVeil, BellToggle, BranchedMenu, GlideSelect, PulseHeart, LatticeLoader) + adapted Rare UI DeleteButton. Cinematic dark-green hero styled after the reference layout (left pill nav, center logo, right search/login/signup).

## UI Components (actually used, not just inspired)

- `src/components/bits/CRTWarp.jsx` — react-bits hero backdrop (three.js CRT plasma, green phosphor on near-black). Home hero only, `paused` under reduced-motion.
- `src/components/bits/DitherVeil.jsx` — react-bits cursor-reveal art (ogl) for the featured product visual; falls back to picsum art when a product has no photo.
- `src/components/bits/BranchedMenu.jsx` — react-bits category filter (Shop → All + live categories from the API).
- `src/components/bits/GlideSelect.jsx` — react-bits sort selector (Featured / Newest / Price ↑↓ / Stock).
- `src/components/bits/PulseHeart.jsx` — react-bits wishlist hearts (`showCount={false}`, real localStorage set — no fake like counts).
- `src/components/bits/BellToggle.jsx` — react-bits back-in-stock toggle on out-of-stock cards (localStorage preference).
- `src/components/bits/LatticeLoader.jsx` — react-bits loading/error indicator for the catalog fetch.
- `src/components/bits/CountUp.jsx` — react-bits animated featured price.
- `src/components/bits/SpecularButton.jsx` — react-bits glass buttons (nav Login/Sign up/Logout, mouse-follow shine).
- `src/components/bits/GlassSurface.jsx` — react-bits frost wrapping the whole navbar; `GlassPanel.jsx` reuses the same preset for shop panels, cards, forms.
- `src/components/rare/DeleteButton.jsx` — adapted Rare UI hold-to-confirm delete.
- All react-bits files keep their MIT + Commons Clause © David Haz notice — use inside the app, do not resell the components. Rare UI file keeps © Swami Malode + visible footer link to `https://rareui.com` (license requirement).
- New runtime deps exist only because these exact components need them (`three` for CRTWarp, `ogl` for DitherVeil, `motion` + `hugeicons` for toggles/selects).

## Folder Structure

```
TeriEcommerce/
├── backend/
│   ├── config/db.js              # Mongoose connection
│   ├── controllers/auth.controller.js
│   ├── controllers/product.controller.js
│   ├── controllers/order.controller.js      # placeOrder (stock check) + myOrders
│   ├── middleware/auth.middleware.js       # Bearer check -> req.user
│   ├── middleware/role.middleware.js       # requireSeller -> 403 for buyers
│   ├── middleware/validation.middleware.js # validationResult -> 400
│   ├── middleware/error.middleware.js      # central errors
│   ├── models/User.js                      # + role buyer/seller
│   ├── models/Product.js
│   ├── models/Order.js                     # items snapshot + total + shipping
│   ├── routes/auth.routes.js
│   ├── routes/product.routes.js
│   ├── routes/order.routes.js              # GET/POST /api/orders (auth)
│   ├── validators/auth.validator.js        # + role buyer/seller
│   ├── validators/product.validator.js     # + purchase quantity
│   ├── validators/order.validator.js       # items + name/address/phone
│   ├── utils/token.js              # JWT + cookie helpers
│   ├── server.js                   # trust proxy enabled for Render
│   ├── package.json                # engines: node >= 18, npm start
│   ├── TeriEcommerce API/          # Bruno collection (import folder into Bruno)
│   ├── .env (not committed)
│   └── .env.example
├── frontend/
│   ├── src/services/api.js         # axios instance + refresh logic
│   ├── src/context/AuthContext.jsx # user, login, logout, silent refresh
│   ├── src/context/CartContext.jsx  # {id: qty} cart + localStorage
│   ├── src/components/ProtectedRoute.jsx # + roles={['seller']} support
│   ├── src/components/Navbar.jsx
│   ├── src/components/Footer.jsx         # visible credit to React Bits + Rare UI
│   ├── src/components/bits/CountUp.jsx       # vendored react-bits price counter
│   ├── src/components/bits/CRTWarp.jsx + .css       # hero backdrop (needs three)
│   ├── src/components/bits/DitherVeil.jsx + .css    # featured art reveal (needs ogl)
│   ├── src/components/bits/BranchedMenu.jsx + .css  # category filter
│   ├── src/components/bits/GlideSelect.jsx + .css   # sort selector
│   ├── src/components/bits/PulseHeart.jsx + .css    # wishlist hearts
│   ├── src/components/bits/BellToggle.jsx + .css    # back-in-stock toggle
│   ├── src/components/bits/LatticeLoader.jsx + .css # loading/error state
│   ├── src/components/bits/SpecularButton.jsx + .css # glass nav buttons (needs ogl)
│   ├── src/components/bits/SpecularButton.jsx + .css # glass nav buttons (needs ogl)
│   ├── src/components/bits/GlassSurface.jsx + .css  # whole-navbar frost (no deps)
│   ├── src/components/GlassPanel.jsx         # house preset matching the navbar
│   ├── src/components/rare/DeleteButton.jsx  # adapted Rare UI delete-button
│   ├── src/hooks/useWishlist.js              # localStorage wishlist + notify sets
│   ├── src/pages/Home.jsx                    # landing + newest arrivals
│   ├── src/pages/Shop.jsx                    # catalog + Buy now + Add to cart
│   ├── src/pages/Cart.jsx                    # qty controls + subtotal (public)
│   ├── src/pages/Checkout.jsx                # address form + place order (auth)
│   ├── src/pages/Profile.jsx                 # account + order history (auth)
│   ├── src/pages/Register.jsx, Login.jsx, ProductForm.jsx, NotFound.jsx
│   ├── src/App.jsx                 # Router
│   ├── .env (VITE_API_URL)
│   └── .env.example
├── README.md
└── .gitignore
```

## Environment Variables

Backend `backend/.env.example`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

Frontend `frontend/.env.example`:
```
VITE_API_URL=http://localhost:5000
```

Never commit `.env`. Use separate secrets for access and refresh tokens.

## Local Setup

Requirements: Node 18+, MongoDB (local `mongodb://127.0.0.1:27017/teri_ecommerce` or Atlas).

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI + secrets
npm run dev            # or npm start
# API at http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
npm run build          # production build check
```

### MongoDB Setup

- Local: install MongoDB Community, create DB `teri_ecommerce`, set `MONGO_URI=mongodb://127.0.0.1:27017/teri_ecommerce`
- Atlas: create free cluster, whitelist IP, get connection string, set as `MONGO_URI`

## Authentication Explanation

- **What is JWT?** Signed JSON token server can verify without DB lookup. Header.Payload.Signature.
- **What is middleware?** Function running before controller (e.g. check token, check validation).
- **Why access + refresh?** Access is short (15m) — if stolen, damage is limited. Refresh is long (7d) in HTTP-only cookie — lets us get new access tokens without asking password again.
- **Why bcrypt?** One-way password hashing with salt. We store hash (10 rounds), verify with `bcrypt.compare()`. Never log/return/store plaintext.
- **Why HTTP-only cookies?** JS cannot read them (`document.cookie`), so XSS cannot steal refresh token. Browser sends automatically with `withCredentials:true`.
- **Why store refresh hash server-side?** To revoke on logout/rotation. We store SHA-256 hash, compare on refresh. If DB leaks, raw token is safe.
- **What does `req.user` mean?** `authenticate` middleware decodes access token and sets `req.user = { id }`. Controllers use it — never trust ID from frontend body.
- **What does Bearer mean?** `Authorization: Bearer <token>` = "holder of this token is authorized".
- **Logout revocation?** `logout` finds user by refresh-hash, sets `refreshToken=null`, clears cookie. Old refresh then fails `403 Refresh token revoked`.

## API Documentation

### POST /api/auth/register (public)

Request:
```json
{
  "name": "Divyansh",
  "email": "divyansh@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "seller"
}
```
`role` is optional (`buyer`/`seller`, defaults to `buyer`). Response `201`:
```json
{
  "message": "User registered successfully",
  "user": { "_id": "...", "name": "Divyansh", "email": "divyansh@example.com", "role": "seller" }
}
```
Errors: `400` validation (bad role → field error), `409 Email already registered`. No tokens returned.

### POST /api/auth/login (public, rate-limited)

Request: `{ "email": "...", "password": "..." }`
Response `200`: `{ "accessToken": "..." }` + `Set-Cookie: refreshToken=...; HttpOnly`
Errors: `401 Invalid email or password` (generic — do not reveal which failed).

### POST /api/auth/refresh-token (cookie)

Reads `refreshToken` cookie. Verifies with `REFRESH_TOKEN_SECRET`, checks DB hash, rotates (new refresh + new access). Response `200`: `{ "accessToken": "..." }`. Errors: `401 missing`, `403 invalid/revoked/expired` (clears cookie).

### POST /api/auth/logout

Clears DB hash + cookie. Response: `{ "message": "Logged out successfully" }`.
Design: cookie-based so it works even if access token expired.

### GET /api/auth/me (protected)

Header: `Authorization: Bearer <accessToken>`
Response: `{ "user": { "_id": "...", "name": "...", "email": "...", "role": "buyer" } }`
Errors: `401` missing/invalid/expired, `404` user not found. Never returns password/refreshToken.

### POST /api/products (seller-only)

Header: Bearer. Body:
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard",
  "price": 2499,
  "stock": 20,
  "category": "Keyboard",
  "image": "https://example.com/image.jpg"
}
```
Response `201` product object. Errors: `401` unauthenticated, `403 Only sellers can manage products`, `400` validation.

### GET /api/products (public)

Optional `?page=1&limit=10` (validated). Response:
```json
{ "page": 1, "limit": 20, "total": 5, "products": [ ... ] }
```

### GET /api/products/:id (public)

Errors: `400 Invalid product ID` (bad ObjectId), `404 Product not found`.

### PUT /api/products/:id (seller-only)

Body: any subset of product fields (validated, no negative price/stock, no empty name). Steps: validate ID → 404 if missing → update → return updated. Errors: `400/401/403/404`.

### DELETE /api/products/:id (seller-only)

Validate ID → 404 if missing → delete. Response: `{ "message": "Product deleted successfully" }`. Errors: `401/403/404`.

### POST /api/products/:id/purchase (any logged-in user)

Body: `{ "quantity": 1 }` (optional, whole number ≥ 1). Decrements stock, never below zero. Response: `{ "message": "Purchase successful", "product": { ...updated } }`. Errors: `401` unauthenticated, `400 Not enough stock available` / bad quantity, `404` product not found.

### POST /api/orders (logged-in user)

Checkout: cart items + shipping. Body:
```json
{
  "items": [{ "product": "<id>", "quantity": 2 }],
  "name": "Divyansh",
  "address": "123 Test Street",
  "phone": "9999999999"
}
```
Server checks stock for every item, decrements, snapshots name/price into the order, computes total itself (never trusts client total). Response `201`: `{ "message": "Order placed successfully", "order": { ... } }`. Errors: `401`, `400` empty cart / over-stock, `404` bad product id.

### GET /api/orders (logged-in user)

Returns only the caller's orders, newest first: `{ "orders": [ ... ] }`. Errors: `401`.

## Validation Behavior

All body/param/query go through `express-validator` arrays + `validateRequest` middleware BEFORE controllers.

Invalid → `400`:
```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please enter a valid email" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```
Frontend maps this to per-field messages. Never just `{ message: "Invalid input" }`.

Rules: name 2-50 chars, email valid + normalized, password min 8 + upper/lower/number/symbol, confirmPassword must match, role buyer/seller if supplied, price/stock numeric ≥0, quantity whole number ≥1, image must be URL if supplied, `:id` must be valid ObjectId, page/limit positive.

Why 400? Client sent bad data — fix and retry.
Why 401? Missing/invalid access token.
Why 403? Logged in but wrong role (buyers can't manage products).
Why 409? Duplicate email is a conflict with existing resource.

## Security Considerations

- bcrypt 10 rounds, never log/return plaintext
- Secrets only in `.env`, separate access/refresh secrets
- Access 15m, refresh 7d + rotation + `jti` uniqueness + hash stored
- Refresh in HTTP-only cookie (`secure` in prod, `sameSite lax/none`, 7d maxAge)
- CORS `origin=CLIENT_URL` + `credentials:true`
- Generic login errors, ObjectId validated before DB, `req.user.id` trusted over body IDs
- Roles: selling gated by `requireSeller` (live DB role, `403` for buyers); purchase open to any login, stock never negative
- Rate-limit login (20/15min), no stack traces in production, consistent `{ message }` errors
- Frontend protection is UX only — backend enforces all auth

## Deployment Instructions

### A. Everything you need (checklist)

1. MongoDB Atlas M0 free cluster + `MONGO_URI` connection string
2. Backend secrets: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` (long random strings, different from each other)
3. Backend env on Render: `PORT=10000` (Render sets it), `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CLIENT_URL=https://your-frontend-url`, `NODE_ENV=production`
4. Frontend env: `VITE_API_URL=https://your-backend.onrender.com`
5. Bruno (or Postman) Desktop + `backend/TeriEcommerce API/` collection folder
6. GitHub repo with `backend/` + `frontend/` pushed (`.env` never pushed)

Generate secrets (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run twice — once for access, once for refresh.

### B. MongoDB Atlas steps

1. https://cloud.mongodb.com → Create account → Create M0 free cluster
2. Database Access → Add user `teriuser` + strong password → role `readWriteAnyDatabase`
3. Network Access → Add IP `0.0.0.0/0` (for Render; restrict later if you want)
4. Database → Connect → Drivers → Node.js → copy string:
   `mongodb+srv://teriuser:<password>@cluster0.xxxxx.mongodb.net/teri_ecommerce?retryWrites=true&w=majority`
5. Replace `<password>`, keep `/teri_ecommerce` DB name.

### C. Backend live on Render (Express)

1. Push repo to GitHub.
2. https://dashboard.render.com → New → Web Service → select repo
3. Root Directory: `backend`, Build: `npm install`, Start: `npm start`, Instance: Free
4. Environment → add the 6 vars from A.3 (`NODE_ENV=production` is critical for secure cookies)
5. Deploy → note URL `https://teri-backend.onrender.com` → open `/` → expect `{"message":"E-commerce API running"}`
6. Notes: code already has `app.set('trust proxy',1)` + `engines node>=18`. Free Render sleeps — first request can take ~50s.

Cross-site cookies (Render backend + Vercel frontend): both must be HTTPS, backend `secure:true + sameSite:none` (auto in production), `CLIENT_URL` must exactly equal frontend origin, frontend axios uses `withCredentials:true`.

### D. Frontend deploy (Vercel)

1. Vercel → New Project → same repo → Root `frontend`, Build `npm run build`, Output `dist`
2. Env: `VITE_API_URL=https://teri-backend.onrender.com`
3. Deploy → set backend `CLIENT_URL` to that Vercel URL → redeploy backend.

Frontend (Vercel/Netlify) alt short version:
- Set `VITE_API_URL=https://your-backend-url`
- Build: `npm run build`, output `dist/`

### E. Bruno / Postman (Express testing)

We use Express + real API testing (no fake APIs). The Bruno collection lives at `backend/TeriEcommerce API/`:
1. Bruno → Open Collection → select that folder (or Postman → Import the `.request.yaml` files work the same way)
2. Collection Variables: set `baseUrl` to `http://localhost:5000` local or Render URL live.
3. Flow: `Register` (role buyer/seller) → `Login` (auto-saves `accessToken`) → `Me` / `Create` (seller) / `Purchase` / `Update` / `Delete` use `Bearer {{accessToken}}`.
4. Cookies: client auto-stores `refreshToken` cookie. For `Refresh token` + `Logout`, ensure cookies enabled. If testing cross-site live backend, test refresh/logout in browser too because API-client cookie domains differ.
5. `Create` auto-saves `productId` for get/update/purchase/delete.

## Testing Checklist (verified live against Atlas + earlier 23/23 in-memory run)

Auth: register ok (+role)/duplicate 409/invalid 400 incl. bad role, login ok/wrong 401, me returns role, refresh rotation + old revoked 403, logout + refresh-after-logout rejected.
Roles: buyer POST/PUT/DELETE → `403 Only sellers can manage products`; seller CRUD works.
Purchase: buy decrements stock, over-buy → `400 Not enough stock`, no-auth → `401`.
Orders: place order `201` (stock 3→1, server total), over-buy → `400`, empty cart → `400` field error, no-auth → `401`, my-orders lists own orders.
Products: get all/one/invalid-ID 400/missing 404, update ok/missing 404, delete ok.
Validation: weak password, mismatch, missing name, negative price/stock, bad ObjectId.
Status codes verified. Password hashed (`$2a$10$...`), refresh stored as hash.

Use Thunder Client/Postman: enable cookies, set `Authorization: Bearer <accessToken>` for protected routes.
