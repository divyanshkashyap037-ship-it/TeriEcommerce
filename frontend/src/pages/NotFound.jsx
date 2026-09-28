import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container narrow center">
      <h2>404 — Page not found</h2>
      <p>
        <Link to="/products">Back to products</Link>
      </p>
    </div>
  );
}
