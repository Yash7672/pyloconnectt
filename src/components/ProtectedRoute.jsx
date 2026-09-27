import { Navigate } from 'react-router-dom';

// Blocks access to /dashboard while no session exists.
// The `session` prop is the single source of truth managed in App.jsx.
export default function ProtectedRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}